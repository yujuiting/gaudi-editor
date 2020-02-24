import { Service } from 'typedi';
import { BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface Command {
  label: string;
  do: () => void;
  undo: () => void;
}

export interface ConcatableCommand<T> {
  label: string;
  execute: (args: T) => void;
  prev: T;
  next: T;
}

type AnyCommand<T = any> = Command | ConcatableCommand<T>;

type InternalCommand = AnyCommand & { timestamp: number };

function isConcatableCommand<T>(command: AnyCommand<T>): command is ConcatableCommand<T> {
  return typeof (command as ConcatableCommand<T>).execute === 'function';
}

@Service()
export class HistoryService {
  get history$() {
    return this.history.asObservable();
  }

  get current$() {
    return this.current.asObservable();
  }

  get isLatest$() {
    return this.current$.pipe(
      map(() => this.isLatest()),
      startWith(this.isLatest())
    );
  }

  get isOldest$() {
    return this.current$.pipe(
      map(() => this.isOldest()),
      startWith(this.isOldest())
    );
  }

  private commands: InternalCommand[] = [];

  private history = new BehaviorSubject<string[]>([]);

  private current = new BehaviorSubject(-1);

  isLatest() {
    return this.getVersion() === this.commands.length - 1;
  }

  isOldest() {
    return this.getVersion() < 0;
  }

  getVersion() {
    return this.current.value;
  }

  rollTo(version: number) {
    while (version > this.getVersion()) {
      this.redo();
    }

    while (version < this.getVersion()) {
      this.undo();
    }
  }

  push<T>(command: AnyCommand<T>) {
    if (!this.isLatest()) {
      this.commands.splice(this.current.value + 1);
    }

    this.doCommand(command);

    const timestamp = Date.now();

    if (isConcatableCommand(command)) {
      const lastCommand = this.commands[this.commands.length - 1];

      // perform command concating if last command is also a concatable command and has same label
      if (
        lastCommand &&
        timestamp - lastCommand.timestamp < 500 &&
        isConcatableCommand(lastCommand) &&
        lastCommand.label === command.label
      ) {
        command = { ...command, prev: lastCommand.prev as T };
        this.commands.pop();
      }
    }

    this.current.next(this.commands.push({ ...command, timestamp }) - 1);
    this.history.next(this.commands.map(command => command.label));
  }

  redo() {
    if (this.isLatest()) return;

    this.current.next(this.current.value + 1);

    const command = this.commands[this.current.value];

    this.doCommand(command);
  }

  undo() {
    if (this.isOldest()) return;

    const command = this.commands[this.current.value];

    this.undoCommand(command);

    this.current.next(this.current.value - 1);
  }

  doCommand<T>(command: AnyCommand<T>) {
    if (isConcatableCommand(command)) {
      command.execute(command.next);
    } else {
      command.do();
    }
  }

  undoCommand<T>(command: AnyCommand<T>) {
    if (isConcatableCommand(command)) {
      command.execute(command.prev);
    } else {
      command.undo();
    }
  }
}

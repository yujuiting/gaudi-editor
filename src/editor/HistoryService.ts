import { Service } from 'typedi';
import { BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { KeybindingService } from 'base/KeybindingService';
import { Logger, LoggerService } from 'base/LoggerService';

interface Command {
  label: string;
  undoable?: boolean;
}

export interface SimpleCommand extends Command {
  do: () => void;
  undo: () => void;
}

export interface ConcatableCommand<T> extends Command {
  execute: (args: T) => void;
  prev: T;
  next: T;
}

type AnyCommand<T = any> = SimpleCommand | ConcatableCommand<T>; // eslint-disable-line @typescript-eslint/no-explicit-any

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
    return this.current.pipe(
      map(() => this.isLatest()),
      startWith(this.isLatest())
    );
  }

  get isOldest$() {
    return this.current.pipe(
      map(() => this.isOldest()),
      startWith(this.isOldest())
    );
  }

  get undoable$() {
    return this.current.pipe(map(() => !this.canUndo()));
  }

  private commands: InternalCommand[] = [];

  private history = new BehaviorSubject<string[]>([]);

  private current = new BehaviorSubject(-1);

  private logger: Logger;

  constructor(keybinding: KeybindingService, logger: LoggerService) {
    this.logger = logger.create('HistoryService');

    keybinding.define({
      id: 'edit.undo',
      parts: ['Meta', 'KeyZ'],
      onEnter: () => this.undo(),
    });

    keybinding.define({
      id: 'edit.redo',
      parts: ['Meta', 'Shift', 'KeyZ'],
      onEnter: () => this.redo(),
    });
  }

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

  reset() {
    this.commands = [];
    this.history.next([]);
    this.current.next(-1);
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

  canUndo() {
    if (this.isOldest()) return false;
    const command = this.getCurrent();
    if (command.undoable) return false;
    return true;
  }

  redo() {
    if (this.isLatest()) return false;

    const command = this.getCurrent();

    try {
      this.doCommand(command);
      this.current.next(this.current.value + 1);
      return true;
    } catch (error) {
      this.logger.error('redo fail', { error });
      return false;
    }
  }

  undo() {
    if (this.isOldest()) return false;

    const command = this.getCurrent();

    try {
      this.undoCommand(command);
      this.current.next(this.current.value - 1);
      return true;
    } catch (error) {
      this.logger.error('undo fail', { error });
      return false;
    }
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

  private getCurrent() {
    return this.commands[this.current.value];
  }
}

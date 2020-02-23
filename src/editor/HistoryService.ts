import { Service } from 'typedi';
import { BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface Command {
  label: string;
  do: () => void;
  undo: () => void;
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

  private commands: Command[] = [];

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

  push(command: Command, concatenable = false) {
    if (!this.isLatest()) {
      this.commands.splice(this.current.value + 1);
      concatenable = false;
    }

    command.do();

    if (concatenable && !this.isOldest()) {
      const lastCommand = this.commands[this.commands.length - 1];
      // only perform command concating if both have same label
      if (lastCommand.label === command.label) {
        this.commands.pop();
        command = { ...command, undo: lastCommand.undo };
      }
    }

    this.current.next(this.commands.push(command) - 1);

    this.history.next(this.commands.map(command => command.label));
  }

  redo() {
    if (this.isLatest()) return;

    this.current.next(this.current.value + 1);

    const command = this.commands[this.current.value];

    command.do();
  }

  undo() {
    if (this.isOldest()) return;

    const command = this.commands[this.current.value];

    command.undo();

    this.current.next(this.current.value - 1);
  }
}

import { Service } from 'typedi';
import { BehaviorSubject } from 'rxjs';

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

  private commands: Command[] = [];

  private history = new BehaviorSubject<string[]>([]);

  private current = new BehaviorSubject(-1);

  isLatest() {
    return this.current.value === this.commands.length - 1;
  }

  isOldest() {
    return this.current.value < 0;
  }

  push(command: Command) {
    if (!this.isLatest()) {
      this.commands.splice(this.current.value + 1);
    }

    command.do();

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

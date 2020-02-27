import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

interface EnterEvent<Name, Data> {
  prev?: Name;
  data: Data;
}

interface LeaveEvent<Name, Data> {
  next: Name;
  data: Data;
}

export interface State<Name, Data> {
  readonly name: Name;
  // possible next state name
  readonly next: Name[];
  readonly onEnter?: (event: EnterEvent<Name, Data>) => void;
  readonly onLeave?: (event: LeaveEvent<Name, Data>) => void;
}

export class FSM<Name = string, Data = void> {
  get current$() {
    return this.current.pipe(map(state => state.name));
  }

  private states = new Map<Name, State<Name, Data>>();

  private current: BehaviorSubject<State<Name, Data>>;

  constructor(states: State<Name, Data>[], startAt: Name, private data: Data) {
    states.forEach(state => this.define(state));
    const state = this.getState(startAt);
    if (state.onEnter) state.onEnter({ data });
    this.current = new BehaviorSubject<State<Name, Data>>(state);
  }

  getCurrent() {
    return this.current.value.name;
  }

  transit(name: Name) {
    const prev = this.getCurrentState();
    const next = this.getState(name);
    if (!prev.next.includes(name)) return;
    if (prev.onLeave) prev.onLeave({ next: next.name, data: this.data });
    if (next.onEnter) next.onEnter({ prev: prev.name, data: this.data });
    this.current.next(next);
  }

  private define(state: State<Name, Data>) {
    this.states.set(state.name, state);
  }

  private getState(name: Name) {
    if (!this.states.has(name)) throw new Error('state not defined');
    return this.states.get(name)!;
  }

  private getCurrentState() {
    return this.getState(this.getCurrent());
  }
}

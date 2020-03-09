import { ScaffoldId } from 'base/id';

export interface Scope {
  readonly name: string;
  readonly root: ScaffoldId;
}

export interface CreatedEvent {
  readonly type: 'scope-created-event';
  readonly scope: Scope;
}

export interface DestroyedEvent {
  readonly type: 'scope-destroyed-event';
  readonly scope: Scope;
}

export interface UpdatedEvent {
  readonly type: 'scope-updated-event';
  readonly scope: Scope;
}

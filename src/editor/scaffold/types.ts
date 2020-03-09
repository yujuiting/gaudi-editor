import { JSONObject, JSONValue, Blueprint } from 'gaudi';
import { ScaffoldId } from 'base/id';

/**
 * @todo find a better name
 */
export interface BlueprintEx extends Blueprint {
  readonly id: string;
}

export interface Scaffold {
  readonly id: ScaffoldId;
  readonly type: string;
  readonly props: JSONObject;
}

export interface CreatedEvent {
  readonly id: ScaffoldId;
}

export interface DestroyedEvent {
  readonly id: ScaffoldId;
  readonly parentId: ScaffoldId | undefined;
}

export interface PropUpdatedEvent {
  readonly id: ScaffoldId;
  readonly key: string;
  readonly value: JSONValue;
}

export interface RelationCreatedEvent {
  readonly id: ScaffoldId;
  readonly parentId: ScaffoldId;
  readonly at: number;
}

export interface RelationDestroyedEvent {
  readonly id: ScaffoldId;
  readonly parentId: ScaffoldId;
  readonly at: number;
}

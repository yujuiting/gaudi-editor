import { Service } from 'typedi';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Blueprint, JSONObject, JSONValue } from 'gaudi';
import { generateId } from 'base/id';
import * as object from 'base/object';
import { ViewService } from 'editor/ViewService';

export interface MutableBlueprint extends Mutable<Blueprint> {
  readonly id: string;
  props: JSONObject;
  children: MutableBlueprint[];
}

export interface ImmutableBlueprint extends MutableBlueprint {
  readonly props: Readonly<JSONObject>;
  readonly children: ImmutableBlueprint[];
}

interface BlueprintPropUpdatedEvent {
  type: 'blueprint-prop-updated';
  scope: string;
  id: string;
  key: string;
  value: JSONValue;
}

interface BlueprintChildrenUpdatedEvent {
  type: 'blueprint-children-updated';
  scope: string;
  id: string;
}

interface BlueprintScopeCreatedEvent {
  type: 'blueprint-scope-created';
  scope: string;
  id: string;
}

interface BlueprintScopeDestroyedEvent {
  type: 'blueprint-scope-destroyed';
  scope: string;
  id: string;
}

export type BlueprintUpdatedEvent =
  | BlueprintPropUpdatedEvent
  | BlueprintChildrenUpdatedEvent
  | BlueprintScopeCreatedEvent
  | BlueprintScopeDestroyedEvent;

function toMutableBlueprint(blueprint: Blueprint): MutableBlueprint {
  const id = generateId();
  const { type, props = {}, children = [] } = blueprint;
  return { id, type, props, children: children.map(toMutableBlueprint) };
}

function toBlueprint(mutable: MutableBlueprint): Blueprint {
  const { type } = mutable;
  let props: JSONObject | undefined;
  let children: Blueprint[] | undefined;

  if (object.keys(mutable.props).length > 0) {
    props = mutable.props;
  }

  if (mutable.children.length > 0) {
    children = mutable.children.map(toBlueprint);
  }
  const blueprint: Blueprint = { type, props, children };
  return blueprint;
}

function forEach<T extends { children: T[] }>(item: T, fn: (item: T) => void) {
  let queue = [item];
  let current = queue.shift();
  while (current) {
    fn(current);
    queue = queue.concat(current.children);
    current = queue.shift();
  }
}

@Service()
export class BlueprintService {
  get entry$() {
    return this.entry.asObservable();
  }

  get updateEvent$() {
    return this.updateEvent.asObservable();
  }

  private blueprints = new Map<string, MutableBlueprint>();

  private rootBlueprints = new Map<string, MutableBlueprint>();

  /**
   * blueprint id to root name
   */
  private relations = new Map<string, string>();

  private entry = new BehaviorSubject<string>('');

  private updateEvent = new Subject<BlueprintUpdatedEvent>();

  constructor(private view: ViewService) {}

  import(scope: string, value: Blueprint = { type: 'div' }) {
    const blueprint = toMutableBlueprint(value);
    this.rootBlueprints.set(scope, blueprint);
    forEach(blueprint, current => {
      this.blueprints.set(current.id, current);
      this.relations.set(current.id, scope);
    });
    this.updateEvent.next({ type: 'blueprint-scope-created', scope, id: blueprint.id });
    this.view.create(scope);
  }

  export(name: string) {
    const blueprint = this.rootBlueprints.get(name);
    if (!blueprint) throw new Error();
    return toBlueprint(blueprint);
  }

  exportAll() {
    const roots = this.getScopes();
    const blueprints: Record<string, Blueprint> = {};
    for (const root of roots) {
      blueprints[root] = this.export(root);
    }
    return blueprints;
  }

  destroy(scope: string) {
    const blueprint = this.rootBlueprints.get(scope);
    if (!blueprint) throw new Error();
    forEach(blueprint, current => {
      this.blueprints.delete(current.id);
      this.relations.delete(current.id);
    });
    this.view.destroy(scope);
    this.updateEvent.next({ type: 'blueprint-scope-destroyed', scope, id: blueprint.id });
  }

  get(id: string): ImmutableBlueprint {
    const target = this.blueprints.get(id);
    if (!target) throw new Error();
    return target;
  }

  getRoot(scope: string): ImmutableBlueprint {
    const target = this.rootBlueprints.get(scope);
    if (!target) throw new Error();
    return target;
  }

  getType(id: string) {
    const target = this.blueprints.get(id);
    if (!target) throw new Error();
    return target.type;
  }

  getProp<T extends JSONValue>(id: string, key: string) {
    const target = this.blueprints.get(id);
    if (!target) throw new Error();
    return object.get<T>(target.props, key);
  }

  getChildrenCount(id: string) {
    const target = this.blueprints.get(id);
    if (!target) throw new Error();
    return target.children.length;
  }

  getChildAt(id: string, at: number) {
    const target = this.blueprints.get(id);
    if (!target) throw new Error();
    if (!target.children[at]) return;
    return toBlueprint(target.children[at]);
  }

  getScopes() {
    return Array.from(this.rootBlueprints.keys());
  }

  setEntry(entry: string) {
    this.entry.next(entry);
  }

  getEntry() {
    return this.entry.value;
  }

  updateProp(id: string, key: string, value: JSONValue) {
    const scope = this.relations.get(id);
    if (!scope) throw new Error('scopt not found');
    const target = this.blueprints.get(id);
    if (!target) throw new Error();
    object.set(target, `props.${key}`, value);
    this.afterUpdated({ type: 'blueprint-prop-updated', scope, id, key, value });
  }

  insertChild(id: string, blueprint: Blueprint, at: number) {
    const scope = this.relations.get(id);
    if (!scope) throw new Error('scopt not found');
    const target = this.blueprints.get(id);
    if (!target) throw new Error();
    const child = toMutableBlueprint(blueprint);
    this.blueprints.set(child.id, child);
    target.children.splice(at, 0, child);
    this.afterUpdated({ type: 'blueprint-children-updated', scope, id });
  }

  removeChild(id: string, at: number) {
    const scope = this.relations.get(id);
    if (!scope) throw new Error('scopt not found');
    const target = this.blueprints.get(id);
    if (!target) throw new Error();
    target.children.splice(at, 1);
    this.afterUpdated({ type: 'blueprint-children-updated', scope, id });
  }

  private afterUpdated(event: BlueprintUpdatedEvent) {
    this.updateEvent.next(event);
  }
}

export function filterEvent(scope: string, id?: string) {
  return filter<BlueprintUpdatedEvent>(e => {
    if (e.scope !== scope) return false;
    if (id && e.id !== id) return false;
    return true;
  });
}

export function filterEventType(...types: Array<BlueprintUpdatedEvent['type']>) {
  return filter<BlueprintUpdatedEvent>(e => types.includes(e.type));
}

export function filterPropUpdateEvent(id?: string, key?: string) {
  return filter<BlueprintUpdatedEvent, BlueprintPropUpdatedEvent>(
    (e): e is BlueprintPropUpdatedEvent => {
      if (e.type !== 'blueprint-prop-updated') return false;
      if (id && e.id !== id) return false;
      if (key && e.key !== key) return false;
      return true;
    }
  );
}

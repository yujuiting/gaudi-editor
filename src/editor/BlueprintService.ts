import { Service } from 'typedi';
import { BehaviorSubject, Subject } from 'rxjs';
import { Blueprint, JSONObject, JSONValue } from 'gaudi';
import { generateId } from 'base/id';
import * as object from 'base/object';
import { ViewService } from 'editor/ViewService';

export interface MutableBlueprint extends Mutable<Blueprint> {
  id: string;
  props: JSONObject;
  children: MutableBlueprint[];
}

function toMutable(blueprint: Blueprint): MutableBlueprint {
  const id = generateId();
  const { type, props = {}, children = [] } = blueprint;
  return { id, type, props, children: children.map(toMutable) };
}

function toImmutable(mutable: MutableBlueprint): Blueprint {
  const { type } = mutable;
  let props: JSONObject | undefined;
  let children: Blueprint[] | undefined;

  if (object.keys(mutable.props).length > 0) {
    props = mutable.props;
  }

  if (mutable.children.length > 0) {
    children = mutable.children.map(toImmutable);
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

  get createdRootName$() {
    return this.createdRootName.asObservable();
  }

  get updatedRootName$() {
    return this.updatedRootName.asObservable();
  }

  get destroyRootName$() {
    return this.destroyRootName.asObservable();
  }

  private blueprints = new Map<string, MutableBlueprint>();

  private rootBlueprints = new Map<string, MutableBlueprint>();

  /**
   * blueprint id to root name
   */
  private relations = new Map<string, string>();

  private entry = new BehaviorSubject<string>('');

  private createdRootName = new Subject<string>();

  private updatedRootName = new Subject<string>();

  private destroyRootName = new Subject<string>();

  constructor(private view: ViewService) {}

  import(name: string, value: Blueprint = { type: 'div' }) {
    const blueprint = toMutable(value);
    this.rootBlueprints.set(name, blueprint);
    forEach(blueprint, current => {
      this.blueprints.set(current.id, current);
      this.relations.set(current.id, name);
    });
    this.createdRootName.next(name);
    this.view.create(name);
  }

  export(name: string) {
    const blueprint = this.rootBlueprints.get(name);
    if (!blueprint) throw new Error();
    return toImmutable(blueprint);
  }

  exportAll() {
    const roots = this.getRootNames();
    const blueprints: Record<string, Blueprint> = {};
    for (const root of roots) {
      blueprints[root] = this.export(root);
    }
    return blueprints;
  }

  destroy(name: string) {
    const blueprint = this.rootBlueprints.get(name);
    if (!blueprint) throw new Error();
    forEach(blueprint, current => {
      this.blueprints.delete(current.id);
      this.relations.delete(current.id);
    });
    this.destroyRootName.next(name);
    this.view.destroy(name);
  }

  get(id: string) {
    return this.blueprints.get(id);
  }

  getRoot(name: string) {
    return this.rootBlueprints.get(name);
  }

  getRootNames() {
    return Array.from(this.rootBlueprints.keys());
  }

  setEntry(entry: string) {
    this.entry.next(entry);
  }

  getEntry() {
    return this.entry.value;
  }

  updateProp(id: string, key: string, value: JSONValue) {
    const target = this.get(id);
    if (!target) throw new Error();
    target.props[key] = value;
    this.afterUpdated(id);
  }

  insertChild(id: string, blueprint: Blueprint, at: number) {
    const target = this.get(id);
    if (!target) throw new Error();
    const child = toMutable(blueprint);
    this.blueprints.set(child.id, child);
    target.children.splice(at, 0, child);
    this.afterUpdated(id);
  }

  removeChild(id: string, at: number) {
    const target = this.get(id);
    if (!target) throw new Error();
    target.children.splice(at, 1);
    this.afterUpdated(id);
  }

  private afterUpdated(id: string) {
    const rootName = this.relations.get(id);
    if (!rootName) throw new Error('not found root name');
    this.updatedRootName.next(rootName);
  }
}

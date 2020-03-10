import { Service } from 'typedi';
import { Subject } from 'rxjs';
import { Blueprint, JSONValue } from 'gaudi';
import * as object from 'base/object';
import { Node } from 'base/Node';
import { ComponentService } from 'editor/ComponentService';
import { toScaffold, toBlueprint } from './utils';
import {
  Scaffold,
  CreatedEvent,
  DestroyedEvent,
  PropUpdatedEvent,
  RelationCreatedEvent,
  RelationDestroyedEvent,
} from './types';
import { ScaffoldId } from 'base/id';

@Service()
export class ScaffoldService {
  get created$() {
    return this.created.asObservable();
  }

  get destroyed$() {
    return this.destroyed.asObservable();
  }

  get propUpdated$() {
    return this.propUpdated.asObservable();
  }

  get relationCreated$() {
    return this.relationCreated.asObservable();
  }

  get relationDestroyed$() {
    return this.relationDestroyed.asObservable();
  }

  private scaffolds = new Map<ScaffoldId, Scaffold>();

  private nodes = new Map<ScaffoldId, Node<ScaffoldId>>();

  private created = new Subject<CreatedEvent>();

  private destroyed = new Subject<DestroyedEvent>();

  private propUpdated = new Subject<PropUpdatedEvent>();

  private relationCreated = new Subject<RelationCreatedEvent>();

  private relationDestroyed = new Subject<RelationDestroyedEvent>();

  constructor(private component: ComponentService) {}

  /**
   * create scaffold by blueprint and return root scaffold id
   */
  create(blueprint: Blueprint) {
    const { scaffolds, nodes, root } = toScaffold(blueprint);
    for (const [id, scaffold] of scaffolds) {
      this.scaffolds.set(id, scaffold);
    }
    for (const [id, node] of nodes) {
      this.nodes.set(id, node);
    }
    this.created.next({ id: root.value });
    return root.value;
  }

  /**
   * destroy scaffold and its children also all relations
   */
  destroy(id: ScaffoldId) {
    const node = this.getMutableNode(id);
    node.forEach(node => this.performDestroy(node));
  }

  extract(id: ScaffoldId) {
    const scaffolds = this.scaffolds;
    const nodes = this.nodes;
    const root = this.getMutableNode(id);
    return toBlueprint({ scaffolds, nodes, root });
  }

  /**
   * create relation, also destry old relation if need
   */
  createRelation(id: ScaffoldId, parentId: ScaffoldId, at: number) {
    const node = this.getMutableNode(id);
    const parent = this.getMutableNode(parentId);
    node.removeSelfFromParent();
    parent.insertChild(node, at);
    this.relationCreated.next({ id, parentId, at });
    return true;
  }

  destroyRelation(id: ScaffoldId, parentId: ScaffoldId) {
    const node = this.getMutableNode(id);
    const parent = this.getMutableNode(parentId);
    const index = parent.children.indexOf(node);
    if (index < 0) return false;
    parent.removeChild(node);
    this.relationDestroyed.next({ id, parentId, at: index });
    return true;
  }

  get(id: ScaffoldId): Scaffold {
    const target = this.scaffolds.get(id);
    if (!target) throw new Error('not found blueprint');
    return target;
  }

  getType(id: ScaffoldId) {
    const target = this.scaffolds.get(id);
    if (!target) throw new Error();
    return target.type;
  }

  getProp<T extends JSONValue>(id: ScaffoldId, key: string) {
    const target = this.scaffolds.get(id);
    if (!target) throw new Error();
    return object.get<T>(target.props, key);
  }

  getChildrenCount(id: ScaffoldId) {
    const node = this.getMutableNode(id);
    return node.children.length;
  }

  getParent(id: ScaffoldId) {
    const node = this.getMutableNode(id);
    if (!node.parent) throw new Error('not found parent');
    const parent = node.parent;
    const at = parent.children.indexOf(node);
    return { id: parent.value, at };
  }

  getRootParent(id: ScaffoldId) {
    let current = this.getMutableNode(id);
    while (current.parent) {
      current = current.parent;
    }
    return current.value;
  }

  getChildAt(id: ScaffoldId, at: number) {
    if (this.getChildrenCount(id) >= at) throw new Error();
    const node = this.getMutableNode(id);
    const child = node.children[at];
    return child.value;
  }

  updateProp(id: ScaffoldId, key: string, value: JSONValue) {
    const target = this.get(id);
    object.set(target.props, key, value);
    this.propUpdated.next({ id, key, value });
  }

  canInsertChild(id: ScaffoldId, blueprintType: string) {
    const target = this.get(id);
    const { max, forbids, accepts } = this.component.getChildrenConstraint(target.type);
    if (max !== void 0 && this.getChildrenCount(id) === max) return false;
    if (forbids !== void 0 && forbids.includes(blueprintType)) return false;
    if (accepts !== void 0) return accepts.includes(blueprintType);
    return true;
  }

  isParent(id: ScaffoldId, parentId: ScaffoldId) {
    let current = this.getMutableNode(id);
    while (current.value !== parentId) {
      if (!current.parent) return false;
      current = current.parent;
    }
    return true;
  }

  getNode(id: ScaffoldId) {
    return this.getMutableNode(id).toReadonly();
  }

  private getMutableNode(id: ScaffoldId) {
    const node = this.nodes.get(id);
    if (!node) throw new Error('not found node');
    return node;
  }

  private performDestroy(node: Node<ScaffoldId>) {
    const id = node.value;
    const parentId = node.parent?.value;
    node.removeSelfFromParent();
    this.scaffolds.delete(id);
    this.nodes.delete(id);
    this.destroyed.next({ id, parentId });
  }
}

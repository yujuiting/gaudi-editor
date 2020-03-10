import { Service } from 'typedi';
import { map, filter } from 'rxjs/operators';
import { JSONValue, Blueprint } from 'gaudi';
import { HistoryService } from 'editor/HistoryService';
import { ScaffoldService } from 'editor/scaffold/ScaffoldService';
import { ScopeService } from 'editor/scope/ScopeService';
import { ScaffoldId } from 'base/id';

@Service()
export class OperatorService {
  constructor(
    private history: HistoryService,
    private scaffold: ScaffoldService,
    private scope: ScopeService
  ) {}

  createScope(name: string) {
    this.history.push({
      label: 'Create scope',
      do: () => this.scope.create(name),
      undo: () => this.scope.destroy(name),
    });
  }

  destroyScope(name: string) {
    const scope = this.scope.get(name);
    const blueprint = this.scaffold.extract(scope.root);
    this.history.push({
      label: 'Destroy scope',
      do: () => this.scope.destroy(name),
      undo: () => this.scope.create(name, blueprint),
    });
  }

  getProp<T extends JSONValue>(id: ScaffoldId, key: string) {
    return this.scaffold.getProp<T>(id, key);
  }

  watchProp<T extends JSONValue>(id: ScaffoldId, key: string) {
    return this.scaffold.propUpdated$.pipe(
      filter(e => e.id.eq(id) && e.key === key),
      map(e => e.value as T)
    );
  }

  updateProp(id: ScaffoldId, key: string, value: JSONValue) {
    const oldValue = this.getProp(id, key);
    this.history.push({
      label: `Update prop: ${key.replace('.', ' ')}`,
      prev: { id, key, value: oldValue },
      next: { id, key, value },
      execute: args => this.scaffold.updateProp(args.id, args.key, args.value),
    });
  }

  /**
   * insert from tail as default
   */
  insert(id: ScaffoldId, blueprint: Blueprint, at: number) {
    this.history.push({
      label: 'Insert child',
      do: () => {
        const childId = this.scaffold.create(blueprint);
        this.scaffold.createRelation(childId, id, at);
      },
      undo: () => {
        const childId = this.scaffold.getChildAt(id, at);
        this.scaffold.destroyRelation(childId, id);
        this.scaffold.destroy(childId);
      },
    });
  }

  append(id: ScaffoldId, blueprint: Blueprint) {
    const at = this.scaffold.getChildrenCount(id);
    this.insert(id, blueprint, at);
  }

  remove(id: ScaffoldId) {
    const blueprint = this.scaffold.extract(id);
    // we cannot remove an root item
    const parent = this.scaffold.getParent(id);
    this.history.push({
      label: 'Remove child',
      do: () => this.scaffold.destroy(id),
      undo: () => {
        const newId = this.scaffold.create(blueprint);
        this.scaffold.createRelation(newId, parent.id, parent.at);
      },
    });
  }

  removeChild(id: ScaffoldId, at: number) {
    const childId = this.scaffold.getChildAt(id, at);
    this.remove(childId);
  }

  move(id: ScaffoldId, newParentId: ScaffoldId, at: number) {
    const oldParent = this.scaffold.getParent(id);
    const isBackwardInsert = oldParent.id.eq(newParentId) && oldParent.at < at;
    this.history.push({
      label: 'Move child',
      do: () => {
        this.scaffold.destroyRelation(id, oldParent.id);
        // expected index maybe different after destroyed relation
        const fixedAt = isBackwardInsert ? at - 1 : at;
        this.scaffold.createRelation(id, newParentId, fixedAt);
      },
      undo: () => {
        this.scaffold.destroyRelation(id, newParentId);
        this.scaffold.createRelation(id, oldParent.id, oldParent.at);
      },
    });
  }

  moveToLast(id: ScaffoldId, newParentId: ScaffoldId) {
    const at = this.scaffold.getChildrenCount(newParentId);
    return this.move(id, newParentId, at);
  }
}

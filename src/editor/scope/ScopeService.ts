import { Service } from 'typedi';
import { BehaviorSubject, Subject, merge } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Blueprint } from 'gaudi';
import { ScaffoldService } from 'editor/scaffold/ScaffoldService';
import { CreatedEvent, DestroyedEvent, UpdatedEvent, Scope } from './types';
import { ScaffoldId } from 'base/id';
import * as object from 'base/object';

export function filterScopeName(scopeName: string) {
  return filter<CreatedEvent | DestroyedEvent | UpdatedEvent>(e => e.scope.name === scopeName);
}

export function mapToScope() {
  return map<CreatedEvent | DestroyedEvent | UpdatedEvent, Scope>(e => e.scope);
}

function updatedEvent(scope: Scope): UpdatedEvent {
  return { type: 'scope-updated-event', scope };
}

function createdEvent(scope: Scope): CreatedEvent {
  return { type: 'scope-created-event', scope };
}

function destroyedEvent(scope: Scope): DestroyedEvent {
  return { type: 'scope-destroyed-event', scope };
}

@Service()
export class ScopeService {
  get entry$() {
    return this.entry.asObservable();
  }

  get created$() {
    return this.created.asObservable();
  }

  get destroyed$() {
    return this.destroyed.asObservable();
  }

  get updated$() {
    return this.updated.asObservable();
  }

  private entry = new BehaviorSubject<string>('');

  private scopes = new Map<string, Scope>();

  private created = new Subject<CreatedEvent>();

  private destroyed = new Subject<DestroyedEvent>();

  private updated = new Subject<UpdatedEvent>();

  constructor(private scaffold: ScaffoldService) {
    const updated$ = merge(
      this.scaffold.created$,
      this.scaffold.destroyed$,
      this.scaffold.propUpdated$
    ).pipe(
      map(e => {
        const root = this.scaffold.getRootParent(e.id);
        return this.findScopeByRoot(root);
      }),
      filter(object.notNull),
      map(updatedEvent)
    );

    const inserted$ = this.scaffold.relationCreated$.pipe(
      map(e => {
        const root = this.scaffold.getRootParent(e.parentId);
        return this.findScopeByRoot(root);
      }),
      filter(object.notNull),
      map(updatedEvent)
    );

    const removed$ = this.scaffold.relationDestroyed$.pipe(
      map(e => {
        const root = this.scaffold.getRootParent(e.parentId);
        return this.findScopeByRoot(root);
      }),
      filter(object.notNull),
      map(updatedEvent)
    );

    merge(updated$, inserted$, removed$).subscribe(this.updated);
  }

  setEntry(entry: string) {
    this.entry.next(entry);
  }

  getEntry() {
    return this.entry.value;
  }

  create(name: string, blueprint: Blueprint = { type: '__scope__' }) {
    if (this.scopes.has(name)) throw new Error('scope collision');
    const root = this.scaffold.create(blueprint);
    const scope: Scope = { name, root };
    this.scopes.set(name, scope);
    this.created.next(createdEvent(scope));
    return scope;
  }

  destroy(name: string) {
    const scope = this.get(name);
    this.scaffold.destroy(scope.root);
    this.scopes.delete(name);
    this.destroyed.next(destroyedEvent(scope));
  }

  extract(name: string) {
    const scope = this.get(name);
    return this.scaffold.extract(scope.root);
  }

  extractAll() {
    const result: Record<string, Blueprint> = {};
    for (const [name, scope] of this.scopes) {
      result[name] = this.scaffold.extract(scope.root);
    }
    return result;
  }

  getNames() {
    return Array.from(this.scopes.keys());
  }

  get(scopeName: string) {
    const scope = this.scopes.get(scopeName);
    if (!scope) throw new Error('not found scope');
    return scope;
  }

  private findScopeByRoot(root: ScaffoldId) {
    for (const [, scope] of this.scopes) {
      if (scope.root === root) return scope;
    }
    return null;
  }
}

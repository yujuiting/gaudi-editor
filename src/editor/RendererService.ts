import { Service } from 'typedi';
import { Subscription, Subject, merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Project, extractBlueprintName } from 'gaudi';
import { Initializable, Destroyable, InitializerService } from 'base/LifeCycle';
import { LoggerService, Logger } from 'base/LoggerService';
import { EditorService } from 'editor/EditorService';
import { ProjectService } from 'editor/ProjectService';
import { ScopeService } from 'editor/scope/ScopeService';

function getDeps(project: Project, scope: string) {
  const blueprint = project.blueprints[scope];
  const deps = new Set<string>();
  const queue = [blueprint];
  let current = queue.shift();
  while (current) {
    if (current.children) {
      for (const child of current.children) {
        queue.push(child);
      }
    }

    const dep = extractBlueprintName(current.type);
    if (dep) deps.add(dep);
    current = queue.shift();
  }
  return deps;
}

@Service()
export class RendererService implements Initializable, Destroyable {
  private elements = new Map<string, React.ReactElement>();

  // pub -> sub
  private subscribers = new Map<string, Set<string>>();

  private subscriptions: Subscription[] = [];

  private updatedElement = new Subject<string>();

  private logger: Logger;

  constructor(
    private editor: EditorService,
    private project: ProjectService,
    private scope: ScopeService,
    initializer: InitializerService,
    logger: LoggerService
  ) {
    initializer.register(this);
    this.logger = logger.create('RendererService');
  }

  initialize() {
    this.subscriptions.push(
      merge(this.scope.created$, this.scope.updated$).subscribe(e => this.render(e.scope.name)),
      this.scope.destroyed$.subscribe(e => this.clear(e.scope.name))
    );
  }

  destroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  addDeps(scopeName: string, ...depScopes: string[]) {
    const deps = this.subscribers.get(scopeName) || new Set();
    this.subscribers.set(scopeName, new Set([...deps, ...depScopes]));
  }

  render(scopeName: string) {
    const project = this.project.getCurrent();
    this.subscribe(scopeName, getDeps(project, scopeName));
    this.elements.set(scopeName, this.editor.renderer.render(project, scopeName));
    this.updatedElement.next(scopeName);
    this.logger.trace('render', { scope: scopeName });

    // update relavant scopes
    const subs = this.subscribers.get(scopeName);
    if (!subs) return;
    for (const sub of subs) {
      this.render(sub);
    }
  }

  clear(scopeName: string) {
    this.elements.delete(scopeName);
    const subs = this.subscribers.get(scopeName);
    if (!subs) return;
    for (const sub of subs) {
      this.render(sub);
    }
    this.subscribers.delete(scopeName);
  }

  getElement(scopeName: string) {
    return this.elements.get(scopeName);
  }

  watch(scopeName: string) {
    return this.updatedElement.pipe(
      filter(v => v === scopeName),
      map(() => this.getElement(scopeName))
    );
  }

  private subscribe(scope: string, deps: Set<string>) {
    for (const dep of deps) {
      const subs = this.subscribers.get(dep) || new Set();
      subs.add(scope);
      this.subscribers.set(dep, subs);
    }
  }
}

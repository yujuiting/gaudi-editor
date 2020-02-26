import { Service } from 'typedi';
import { Subscription, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Project, extractBlueprintName } from 'gaudi';
import { Initializable, Destroyable, InitializerService } from 'base/LifeCycle';
import { LoggerService, Logger } from 'base/LoggerService';
import { EditorService } from 'editor/EditorService';
import { ProjectService, ProjectEvent } from 'editor/ProjectService';
import { BlueprintService, BlueprintUpdatedEvent } from 'editor/BlueprintService';

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
    private blueprint: BlueprintService,
    initializer: InitializerService,
    logger: LoggerService
  ) {
    initializer.register(this);
    this.logger = logger.create('RendererService');
  }

  initialize() {
    this.subscriptions.push(
      this.project.event$.subscribe(e => this.onProjectEvent(e)),
      this.blueprint.updateEvent$.subscribe(e => this.onBlueprintUpdate(e))
    );
  }

  destroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  addDeps(scope: string, ...depScopes: string[]) {
    const deps = this.subscribers.get(scope) || new Set();
    this.subscribers.set(scope, new Set([...deps, ...depScopes]));
  }

  render(scope: string) {
    const project = this.project.getCurrent();
    this.subscribe(scope, getDeps(project, scope));
    this.elements.set(scope, this.editor.renderer.render(project, scope));
    this.updatedElement.next(scope);
    this.logger.trace('render', { scope });

    // update relavant scopes
    const subs = this.subscribers.get(scope);
    if (!subs) return;
    for (const sub of subs) {
      this.render(sub);
    }
  }

  clear(scope: string) {
    this.elements.delete(scope);
    const subs = this.subscribers.get(scope);
    if (!subs) return;
    for (const sub of subs) {
      this.render(sub);
    }
    this.subscribers.delete(scope);
  }

  getElement(name: string) {
    return this.elements.get(name);
  }

  watch(name: string) {
    return this.updatedElement.pipe(
      filter(v => v === name),
      map(() => this.getElement(name))
    );
  }

  private subscribe(scope: string, deps: Set<string>) {
    for (const dep of deps) {
      const subs = this.subscribers.get(dep) || new Set();
      subs.add(scope);
      this.subscribers.set(dep, subs);
    }
  }

  private onProjectEvent(e: ProjectEvent) {
    switch (e.type) {
      case 'project-opened':
        for (const scope in e.project.blueprints) {
          this.render(scope);
        }
        break;
    }
  }

  private onBlueprintUpdate(e: BlueprintUpdatedEvent) {
    switch (e.type) {
      case 'blueprint-scope-created':
        // ignore it and wait for project loaded
        break;
      case 'blueprint-scope-destroyed':
        this.clear(e.scope);
        break;
      default:
        this.render(e.scope);
        break;
    }
  }
}

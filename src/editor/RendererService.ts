import { Service } from 'typedi';
import { Subscription, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
// import { Gaudi } from 'gaudi';
import { Initializable, Destroyable, InitializerService } from 'base/LifeCycle';
import { LoggerService, Logger } from 'base/LoggerService';
import { EditorService } from 'editor/EditorService';
import { ProjectService, ProjectEvent } from 'editor/ProjectService';
import { BlueprintService, BlueprintUpdatedEvent } from 'editor/BlueprintService';

@Service()
export class RendererService implements Initializable, Destroyable {
  private elements = new Map<string, React.ReactElement>();

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

  render(name: string) {
    const project = this.project.getCurrent();
    this.elements.set(name, this.editor.renderer.render(project, name));
    this.updatedElement.next(name);
    this.logger.trace('render', { name });
  }

  clear(name: string) {
    this.elements.delete(name);
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

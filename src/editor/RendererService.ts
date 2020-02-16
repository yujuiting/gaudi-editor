import { Service } from 'typedi';
import { Subscription, merge, Subject } from 'rxjs';
import { Gaudi } from 'gaudi';
import { Initializable, Destroyable, InitializerService } from 'base/LifeCycle';
import { ProjectService } from 'editor/ProjectService';
import { BlueprintService } from 'editor/BlueprintService';
import { filter, map } from 'rxjs/operators';

@Service()
export class RendererService implements Initializable, Destroyable {
  private elements = new Map<string, React.ReactElement>();

  private subscriptions: Subscription[] = [];

  private updatedElement = new Subject<string>();

  constructor(
    private guaid: Gaudi,
    private project: ProjectService,
    private blueprint: BlueprintService,
    initializer: InitializerService
  ) {
    initializer.register(this);
  }

  initialize() {
    this.subscriptions.push(
      merge(this.blueprint.createdRootName$, this.blueprint.updatedRootName$).subscribe(
        this.render.bind(this)
      ),
      this.blueprint.destroyRootName$.subscribe(this.clear.bind(this))
    );
  }

  destroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  render(name: string) {
    const project = this.project.getCurrent();
    this.elements.set(name, this.guaid.renderer.render(project, name));
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
}

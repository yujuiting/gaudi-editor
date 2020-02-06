import { Service } from 'typedi';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Blueprint, Template, BlueprintData, JSONValue, JSONObject, Gaudi } from 'gaudi';
import { Initializable, Destroyable, ServiceInitializerService } from 'base/LifeCycle';
import { map } from 'rxjs/operators';

@Service()
export class CurrentBlueprintService implements Initializable, Destroyable {
  get entry$() {
    return this.entry.asObservable();
  }

  get components$() {
    return this.components.asObservable();
  }

  get data$() {
    return this.data.asObservable();
  }

  get entryElement$() {
    return this.entryElement.asObservable();
  }

  private entry = new BehaviorSubject('');

  private components = new BehaviorSubject<{ [id: string]: Template }>({});

  private data = new BehaviorSubject<BlueprintData>({});

  private subscriptions: Subscription[] = [];

  private entryElement = new BehaviorSubject<React.ReactElement | null>(null);

  constructor(private gaudi: Gaudi, serviceInitializer: ServiceInitializerService) {
    this.open({
      templates: {
        default: {
          type: 'div',
          props: { children: 'hello gaudi' },
        },
      },
      entry: 'default',
      metadata: {
        plugins: [],
        version: '',
      },
      data: {},
    });

    serviceInitializer.register(this);
  }

  initialize() {
    this.subscriptions.push(
      this.components$
        .pipe(map(() => this.gaudi.renderer.render(this.get())))
        .subscribe(this.entryElement)
    );
  }

  destroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  open(blueprint: Blueprint) {
    this.close();

    this.setEntry(blueprint.entry);

    for (const id in blueprint.templates) {
      this.setComponent(id, blueprint.templates[id]!);
    }

    for (const namespace in blueprint.data) {
      this.resetData(namespace, blueprint.data[namespace]);
    }
  }

  close() {
    this.entry.next('');
    this.components.next({});
    this.data.next({});
  }

  getEntry() {
    return this.entry.value;
  }

  setEntry(entry: string) {
    this.entry.next(entry);
  }

  getComponent(id: string): Template | null {
    return this.components.value[id] || null;
  }

  setComponent(id: string, component: Template) {
    this.components.next({ ...this.components.value, [id]: component });
  }

  getData(namespace: string) {
    return this.data.value[namespace] || {};
  }

  setData(namespace: string, key: string, value: JSONValue) {
    this.data.next({
      ...this.data.value,
      [namespace]: {
        ...this.getData(namespace),
        [key]: value,
      },
    });
  }

  resetData(namespace: string, data: JSONObject = {}) {
    this.data.next({
      ...this.data.value,
      [namespace]: data,
    });
  }

  get(): Blueprint {
    return {
      templates: this.components.value,
      entry: this.entry.value,
      metadata: {
        plugins: [],
        version: '',
      },
      data: this.data.value,
    };
  }
}

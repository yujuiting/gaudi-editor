import { Service } from 'typedi';
import { Subject } from 'rxjs';
import { isObject } from 'base/object';
import { LoggerService, Logger } from 'base/LoggerService';

export interface Initializable {
  initialize(): void | Promise<void>;
}

export interface Destroyable {
  destroy(): void | Promise<void>;
}

export function isInitializable(value: unknown): value is Initializable {
  return isObject(value) && typeof (value as Initializable).initialize === 'function';
}

export function isDestroyable(value: unknown): value is Destroyable {
  return isObject(value) && typeof (value as Destroyable).destroy === 'function';
}

@Service()
export class InitializerService {
  get initialized$() {
    return this.initialized.asObservable();
  }

  private initializables = new Set<Initializable>();

  private destroyables = new Set<Destroyable>();

  private labels = new WeakMap<Initializable | Destroyable, string>();

  private logger: Logger;

  private initialized = new Subject<void>();

  constructor(logger: LoggerService) {
    this.logger = logger.create('ServiceInitializerService');
  }

  register(service: Initializable | Destroyable, label?: string) {
    if (isInitializable(service)) {
      this.initializables.add(service);
    }

    if (isDestroyable(service)) {
      this.destroyables.add(service);
    }

    if (label) this.labels.set(service, label);
  }

  async initializeAll() {
    const promises: unknown[] = [];
    for (const initializable of this.initializables) {
      promises.push(this.initialize(initializable));
    }
    await Promise.all(promises);
    this.initialized.next();
  }

  async destroyAll() {
    const promises: unknown[] = [];
    for (const destroyable of this.destroyables) {
      promises.push(this.destroy(destroyable));
    }
    await Promise.all(promises);
  }

  private async initialize(service: Initializable) {
    const label = this.labels.get(service);
    if (label) this.logger.trace(`initializing ${label}`);
    await service.initialize();
    if (label) this.logger.trace(`initializ ${label}`);
  }

  private async destroy(service: Destroyable) {
    const label = this.labels.get(service);
    if (label) this.logger.trace(`initializing ${label}`);
    await service.destroy();
    if (label) this.logger.trace(`initializ ${label}`);
  }
}

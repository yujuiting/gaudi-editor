import { Service } from 'typedi';
import { Gaudi } from 'gaudi';
import { InitializerService } from 'base/LifeCycle';

@Service()
export class EditorService {
  get renderer() {
    return this.gaudi.renderer;
  }

  get plugins() {
    return this.gaudi.plugins;
  }

  get container() {
    return this.gaudi.container;
  }

  private gaudi!: Gaudi;

  constructor(private initializer: InitializerService) {}

  async initialize(gaudi: Gaudi) {
    this.gaudi = gaudi;
    await this.gaudi.container.loadAll();
    await this.initializer.initializeAll();
  }
}

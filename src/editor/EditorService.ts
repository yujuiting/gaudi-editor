import { Service } from 'typedi';
import { Gaudi } from 'gaudi';
import { InitializerService } from 'base/LifeCycle';
import { EditorPlugin } from 'editor/EditorPlugin';

@Service()
export class EditorService {
  get renderer() {
    return this.gaudi.renderer;
  }

  get plugins() {
    return this.gaudi.plugins;
  }

  private gaudi!: Gaudi;

  constructor(private editorPlugin: EditorPlugin, private initializer: InitializerService) {}

  async initialize(gaudi: Gaudi) {
    this.gaudi = gaudi;
    this.gaudi.plugins.providePlugin(this.editorPlugin);
    await this.initializer.initializeAll();
  }
}

import { ComponentModule } from './ComponentModule';
import { Container } from './Container';
import { Plugin, Plugins } from './Plugin';
import { Renderer } from './Renderer';

export interface GaudiConfig {
  componentModules?: { [id: string]: ComponentModule };
  plugins?: Plugin[];
  providers?: {
    container?: Container<ComponentModule>;
    plugins?: Plugins;
    renderer?: Renderer;
  };
}

export class Gaudi {
  public readonly container: Container<ComponentModule>;

  public readonly plugins: Plugins;

  public readonly renderer: Renderer;

  constructor({ componentModules = {}, plugins = [], providers = {} }: GaudiConfig = {}) {
    this.container = providers.container || new Container();

    this.plugins = providers.plugins || new Plugins(this.container);

    this.renderer = providers.renderer || new Renderer(this.container, this.plugins);

    for (const id in componentModules) {
      const componentModule = componentModules[id];
      if (typeof componentModule === 'function') {
        this.container.provideFactory(id, componentModule);
      } else {
        this.container.provide(id, componentModule);
      }
    }

    for (const plugin of plugins) {
      this.plugins.providePlugin(plugin);
    }
  }
}

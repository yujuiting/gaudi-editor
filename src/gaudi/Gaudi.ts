import { ComponentModule, getComponentName } from './ComponentModule';
import { Container } from './Container';
import { Plugin, Plugins } from './Plugin';
import { Renderer } from './Renderer';

export interface GaudiConfig {
  componentModules?: ComponentModule[];
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

  constructor({ componentModules = [], plugins = [], providers = {} }: GaudiConfig = {}) {
    this.container = providers.container || new Container();

    this.plugins = providers.plugins || new Plugins(this.container);

    this.renderer = providers.renderer || new Renderer(this.container, this.plugins);

    for (const componentModule of componentModules) {
      const name = getComponentName(componentModule);
      if (typeof componentModule === 'function') {
        this.container.provideFactory(name, componentModule);
      } else {
        this.container.provide(name, componentModule);
      }
    }

    for (const plugin of plugins) {
      this.plugins.providePlugin(plugin);
    }
  }
}

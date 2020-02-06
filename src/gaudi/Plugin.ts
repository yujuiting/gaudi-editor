// import * as Immutable from 'immutable';
import { RenderingInfo } from './Renderer';
import { Container } from './Container';
import { Template } from './Blueprint';

export interface Plugin {
  readonly id: string;
  apply?(container: Container): void;
  transformProps?(props: object, info: RenderingInfo, blueprint: Template): object;
  postRender?(
    element: React.ReactElement,
    info: RenderingInfo,
    template: Template
  ): React.ReactElement;
}

/**
 * A group delegate to control plugins
 */
export class Plugins implements Plugin {
  readonly id = '';

  private ids = new Set<string>();

  private plugins = new Array<Plugin>();

  constructor(private container: Container) {}

  transformProps(props: object, info: RenderingInfo, template: Template) {
    return this.plugins.reduce((outProps, plugin) => {
      if (!plugin.transformProps) return outProps;
      return plugin.transformProps(outProps, info, template);
    }, props);
  }

  postRender(element: React.ReactElement, info: RenderingInfo, template: Template) {
    return this.plugins.reduce((outElement, plugin) => {
      if (!plugin.postRender) return outElement;
      return plugin.postRender(outElement, info, template);
    }, element);
  }

  providePlugin(plugin: Plugin) {
    if (!plugin.id) {
      throw new Error('plugin id not found');
    }

    if (this.ids.has(plugin.id)) {
      throw new Error('plugin id collision');
    }

    this.ids.add(plugin.id);
    this.plugins.push(plugin);

    if (plugin.apply) {
      plugin.apply(this.container);
    }
  }

  getPluginIds(): ReadonlyArray<string> {
    return Array.from(this.ids.values());
  }

  getPlugins(): ReadonlyArray<Readonly<Plugin>> {
    return this.plugins;
  }

  getPlugin(id: string) {
    return this.plugins.find(p => p.id === id) || null;
  }
}

import { forwardRef, createElement } from 'react';
import { Blueprint, Project } from './Blueprint';
import { ComponentModule, ComponentType } from './ComponentModule';
import { Container } from './Container';
import { Plugins } from './Plugin';
import { isHtmlTag } from './htmlTags';
import { componentTypeAttribute } from './constants';

const emptyComponentModule = {
  default: forwardRef<HTMLElement, { [componentTypeAttribute]: string }>((props, ref) =>
    createElement('div', { ref }, `not found type: ${props[componentTypeAttribute]}`)
  ),
};

export interface RenderingInfo {
  readonly id: string;
  readonly type: string;
  // belong to which component blueprint
  readonly scope: string;
  readonly depth: number;
  readonly parent: RenderingInfo | null;
  // is this rendering ref to another component blueprint
  readonly refBlueprint: string | undefined;
  readonly key: string;
}

export const extractBlueprintName = (text: string) => {
  const matches = /^blueprint:(.+)/.exec(text);
  return matches && matches[1];
};

export class Renderer {
  private nextId = 0;

  constructor(private container: Container<ComponentModule>, private plugins: Plugins) {}

  /**
   * @todo handle Container.loadAll with React.Suspense
   */
  render(project: Project, blueprintName = project.entry) {
    const blueprint = project.blueprints[blueprintName];
    if (!blueprint) {
      throw new Error();
    }
    return this.renderBlueprint(blueprint, project.blueprints, blueprintName);
  }

  private renderBlueprint(
    blueprint: Blueprint,
    blueprints: Record<string, Blueprint> = {},
    scope: string,
    depth = 0,
    parent: RenderingInfo | null = null
  ): React.ReactElement {
    const blueprintName = extractBlueprintName(blueprint.type);

    const isRef = blueprintName && blueprintName in blueprints;

    const id = `element-${this.nextId++}`;

    const info: RenderingInfo = {
      id,
      key: id,
      type: blueprint.type,
      scope,
      depth,
      parent,
      refBlueprint: blueprintName || undefined,
    };

    let type: ComponentType<any> | string; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (isHtmlTag(blueprint.type) || isRef) {
      type = blueprint.type;
    } else {
      const componentModule = this.container.get(blueprint.type) || emptyComponentModule;
      type = componentModule.default;
    }

    let props = this.plugins.transformProps(blueprint.props || {}, info, blueprint);

    props = { ...props, [componentTypeAttribute]: info.type, key: info.key };

    let element: React.ReactElement;

    if (isRef) {
      const { [blueprintName!]: target, ...rest } = blueprints;
      element = this.renderBlueprint(target, rest, scope, depth + 1, info);
    } else if (blueprint.children && blueprint.children.length > 0) {
      const children = blueprint.children.map(child =>
        this.renderBlueprint(child, blueprints, scope, depth + 1, info)
      );

      element = createElement(type, props, children);
    } else {
      element = createElement(type, props);
    }

    element = this.plugins.postRender(element, info, blueprint);

    return element;
  }
}

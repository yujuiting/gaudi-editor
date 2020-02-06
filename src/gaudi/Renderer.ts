import { forwardRef, createElement } from 'react';
import { Template, Blueprint } from './Blueprint';
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
  // readonly id: string;
  readonly type: string;
  readonly path: string;
  // belong to which component blueprint
  readonly scope: string;
  readonly depth: number;
  readonly parent: RenderingInfo | null;
  // is this rendering ref to another component blueprint
  readonly refTemplate: string | undefined;
}

const extractTemplateName = (text: string) => {
  const matches = /template:(.+)/.exec(text);
  return matches && matches[1];
};

export class Renderer {
  // private nextId = 0;

  constructor(private container: Container<ComponentModule>, private plugins: Plugins) {}

  /**
   * @todo handle Container.loadAll with React.Suspense
   */
  render(blueprint: Blueprint, templateName = blueprint.entry) {
    const template = blueprint.templates[templateName];
    if (!template) {
      throw new Error();
    }
    return this.renderTemplate(template, blueprint.templates, templateName, '');
  }

  private renderTemplate(
    template: Template,
    templates: Record<string, Template> = {},
    scope: string,
    path: string,
    depth = 0,
    parent: RenderingInfo | null = null,
    refTemplate?: string
  ): React.ReactElement {
    const templateName = extractTemplateName(template.type);

    if (templateName && templateName.length > 0) {
      if (templateName in templates) {
        const { [templateName]: target, ...rest } = templates;
        return this.renderTemplate(target, rest, scope, path, depth, parent, templateName);
      }
    }

    const info: RenderingInfo = {
      // id: `${this.nextId++}`,
      type: template.type,
      path,
      scope,
      depth,
      parent,
      refTemplate,
    };

    let type: ComponentType<any> | string; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (isHtmlTag(template.type)) {
      type = template.type;
    } else {
      const componentModule = this.container.get(template.type) || emptyComponentModule;
      type = componentModule.default;
    }

    let props = this.plugins.transformProps(template.props || {}, info, template);

    props = { ...props, [componentTypeAttribute]: info.type };

    let element: React.ReactElement;

    if (template.children && template.children.length > 0) {
      const children = template.children.map((child, index) =>
        this.renderTemplate(child, templates, scope, `${path}/${index}`, depth + 1, info)
      );

      element = createElement(type, props, children);
    } else {
      element = createElement(type, props);
    }

    element = this.plugins.postRender(element, info, template);

    return element;
  }
}

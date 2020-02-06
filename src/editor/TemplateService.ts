import { Service } from 'typedi';
import { Template } from 'gaudi';

export interface MutableTemplate<T extends {} = {}> extends Template {
  id: string;
  type: string;
  props: T;
  children: MutableTemplate[];
}

@Service()
export class TemplateService {
  private rootTemplates = new Map<string, MutableTemplate>();

  private templates = new Map<string, MutableTemplate>();

  private nextId = 0;

  load(name: string, template: Template) {
    this.rootTemplates.set(name, this.toMutableTemplate(template));
  }

  create(name: string) {
    this.load(name, { type: 'div' });
  }

  delete(name: string) {
    const rootTemplate = this.rootTemplates.get(name);
    if (!rootTemplate) return;
    this.rootTemplates.delete(name);

    const queue = [rootTemplate];
    let current = queue.shift();

    while (current) {
      this.templates.delete(current.id);
      // insert children in place
      queue.splice(queue.length + 1, 0, ...current.children);
      current = queue.shift();
    }
  }

  toMutableTemplate(template: Template) {
    const { type, props = {}, children = [] } = template;
    const id = `${this.nextId++}`;
    const mutableTemplate: MutableTemplate = {
      id,
      type,
      props,
      children: children.map(child => this.toMutableTemplate(child)),
    };
    this.templates.set(id, mutableTemplate);
    return mutableTemplate;
  }

  toTemplate(mutableTemplate: MutableTemplate) {
    const { type, props, children } = mutableTemplate;
    const template: Template = {
      type,
      props,
      children: children.map(child => this.toTemplate(child)),
    };
    return template;
  }
}

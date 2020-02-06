import { Service } from 'typedi';
import { createElement } from 'react';
import { Gaudi, RenderingInfo, Plugin } from 'gaudi';
import Fixture from 'editor/Fixture';
import { MutableTemplate } from 'editor/TemplateService';

@Service()
export class EditorPlugin implements Plugin {
  readonly id = 'gaudi-editor';

  constructor(gaudi: Gaudi) {
    gaudi.plugins.providePlugin(this);
  }

  postRender(element: React.ReactElement, info: RenderingInfo, template: MutableTemplate) {
    if (info.refTemplate) {
      return element;
    }

    return createElement(Fixture, { info, template }, element);
  }
}

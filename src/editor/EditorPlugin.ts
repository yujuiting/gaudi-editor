import { Service } from 'typedi';
import { createElement } from 'react';
import { Gaudi, RenderingInfo, Plugin } from 'gaudi';
import { MutableBlueprint } from 'editor/BlueprintService';
import Scaffold from 'editor/Scaffold';

@Service()
export class EditorPlugin implements Plugin {
  readonly id = 'gaudi-editor';

  constructor(gaudi: Gaudi) {
    gaudi.plugins.providePlugin(this);
  }

  postRender(element: React.ReactElement, info: RenderingInfo, blueprint: MutableBlueprint) {
    // if (info.refBlueprint) {
    //   return element;
    // }

    return createElement(Scaffold, { info, blueprint, key: info.key }, element);
  }
}

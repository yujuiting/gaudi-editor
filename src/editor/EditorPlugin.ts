import { Service } from 'typedi';
import { createElement } from 'react';
import { RenderingInfo, Plugin } from 'gaudi';
import { MutableBlueprint } from 'editor/BlueprintService';
import Scaffold from 'editor/Scaffold';

@Service()
export class EditorPlugin implements Plugin {
  readonly id = 'gaudi-editor';

  postRender(element: React.ReactElement, info: RenderingInfo, blueprint: MutableBlueprint) {
    return createElement(Scaffold, { info, blueprint, key: info.key }, element);
  }
}

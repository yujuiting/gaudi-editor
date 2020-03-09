import { Service } from 'typedi';
import { createElement } from 'react';
import { RenderingInfo, Plugin } from 'gaudi';
import { BlueprintEx } from 'editor/scaffold/types';
import Scaffold from 'ui/Scaffold';

@Service()
export class EditorPlugin implements Plugin {
  readonly id = 'gaudi-editor';

  postRender(element: React.ReactElement, info: RenderingInfo, blueprint: BlueprintEx) {
    return createElement(Scaffold, { info, blueprint, key: info.key }, element);
  }
}

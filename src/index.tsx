import 'editor/di';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Container } from 'typedi';
import { Gaudi } from 'gaudi';
import { MouseService } from 'base/MouseService';
import { KeyboardService } from 'base/KeyboardService';
import { WidgetService } from 'editor/widget/WidgetService';
import { ProjectService } from 'editor/ProjectService';
import widgets from './widgets';
import App from './App';
import { EditorPlugin } from 'plugins/EditorPlugin';
import * as serviceWorker from './serviceWorker';
import { StandardPlugin } from 'plugins/standard-plugin/StandardPlugin.dev';
import { PanelService } from 'editor/widget/PanelService';
import { EditorService } from 'editor/EditorService';

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

const gaudi = new Gaudi({
  plugins: [new StandardPlugin(), new EditorPlugin()],
});
const editor = Container.get(EditorService);
const mouse = Container.get(MouseService);
const keyboard = Container.get(KeyboardService);
const widget = Container.get(WidgetService);
const project = Container.get(ProjectService);
const panel = Container.get(PanelService);

mouse.bind(window);
keyboard.bind(window);
widget.registerAll(widgets);

(async () => {
  await editor.initialize(gaudi);
  project.setCurrent({
    blueprints: {
      default: {
        type: 'Stack',
        children: [
          {
            type: 'img',
            props: {
              src:
                'https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Rick_and_Morty_season_4.png/250px-Rick_and_Morty_season_4.png',
            },
          },
          { type: 'a', props: { href: '#', children: 'asd' } },
          { type: 'Text', props: { children: 'Hello' } },
          { type: 'blueprint:button' },
        ],
      },
      button: { type: 'button', props: { children: 'click me' } },
    },
    entry: 'default',
    metadata: { plugins: [], version: '' },
    data: {},
  });
  ReactDOM.render(<App />, document.getElementById('root'));
  setTimeout(() => panel.open('components-and-hierarchy'), 100);
})();

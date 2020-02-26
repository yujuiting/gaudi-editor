import 'editor/di';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Container } from 'typedi';
import { Gaudi } from 'gaudi';
import { KeyboardService } from 'base/KeyboardService';
import { WidgetService } from 'editor/widget/WidgetService';
import { ProjectService } from 'editor/ProjectService';
import widgets from './widgets';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { PanelService } from 'editor/widget/PanelService';
import { EditorService } from 'editor/EditorService';

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

const gaudi = new Gaudi();
const editor = Container.get(EditorService);
const keyboard = Container.get(KeyboardService);
const widget = Container.get(WidgetService);
const project = Container.get(ProjectService);
const panel = Container.get(PanelService);

keyboard.bind(window);
widget.registerAll(widgets);

(async () => {
  await editor.initialize(gaudi);
  project.setCurrent({
    blueprints: {
      default: {
        type: 'div',
        children: [
          {
            type: 'img',
            props: {
              src:
                'https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Rick_and_Morty_season_4.png/250px-Rick_and_Morty_season_4.png',
            },
          },
          { type: 'a', props: { href: '#', children: 'asd' } },
          { type: 'blueprint:button' },
        ],
      },
      button: { type: 'button', props: { children: 'click me' } },
    },
    entry: 'default',
    metadata: { plugins: [], version: '' },
    data: {},
  });
  panel.open('components-and-hierarchy');
  ReactDOM.render(<App />, document.getElementById('root'));
})();

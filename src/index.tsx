import 'editor/di';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Container } from 'typedi';
import { InitializerService } from 'base/LifeCycle';
import { KeyboardService } from 'base/KeyboardService';
import { WidgetRegistryService } from 'editor/widget/WidgetRegistryService';
import { ProjectService } from 'editor/ProjectService';
import widgets from './widgets';
import App from './App';
import * as serviceWorker from './serviceWorker';

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

const initializer = Container.get(InitializerService);
const keyboard = Container.get(KeyboardService);
const widgetRegistry = Container.get(WidgetRegistryService);
const project = Container.get(ProjectService);

keyboard.bind(window);

(async () => {
  await initializer.initializeAll();
  widgetRegistry.register(...widgets);
  project.setCurrent({
    blueprints: {
      default: {
        type: 'img',
        props: {
          src:
            'https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Rick_and_Morty_season_4.png/250px-Rick_and_Morty_season_4.png',
        },
      },
    },
    entry: 'default',
    metadata: { plugins: [], version: '' },
    data: {},
  });
  ReactDOM.render(<App />, document.getElementById('root'));
})();

// ReactDOM.render(<div>hellp</div>, document.getElementById('root'));

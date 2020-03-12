import { Plugin, Container } from 'gaudi';

export class StandardPlugin implements Plugin {
  readonly id = 'standard-component';

  apply(container: Container) {
    container.provideFactory('Stack', () => import('./components/Stack'));
    container.provideFactory('Text', () => import('./components/Text'));
  }
}

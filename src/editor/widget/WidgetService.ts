import { Service } from 'typedi';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoggerService, Logger } from 'base/LoggerService';
import { WidgetRegistryService, PanelWidgetInfo } from 'editor/widget/WidgetRegistryService';
import { map } from 'rxjs/operators';

@Service()
export class WidgetService {
  readonly openedPanel$: Observable<PanelWidgetInfo | null>;

  readonly openedPanelId$: Observable<string | null>;

  private openedPanel = new BehaviorSubject<PanelWidgetInfo | null>(null);

  private logger: Logger;

  constructor(private registry: WidgetRegistryService, logger: LoggerService) {
    this.openedPanel$ = this.openedPanel.asObservable();
    this.openedPanelId$ = this.openedPanel$.pipe(map(info => (info ? info.id : null)));
    this.logger = logger.create('WidgetService');
  }

  openPanel(id: string) {
    const widget = this.registry.getPanelWidget(id);
    if (!widget) {
      this.logger.error(`not found panel: ${id}`);
      return;
    }

    this.openedPanel.next(widget);
  }

  closePanel() {
    this.openedPanel.next(null);
  }

  togglePanel(id: string) {
    const widget = this.registry.getPanelWidget(id);
    if (!widget) {
      this.logger.error(`not found panel: ${id}`);
      return;
    }

    if (this.openedPanel.value === widget) {
      this.closePanel();
    } else {
      this.openPanel(id);
    }
  }
}

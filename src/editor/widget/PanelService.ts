import { Service } from 'typedi';
import { BehaviorSubject } from 'rxjs';
import { WidgetService } from 'editor/widget/WidgetService';

@Service()
export class PanelService {
  get openedId$() {
    return this.openedId.asObservable();
  }

  // opened panel id
  private openedId = new BehaviorSubject('');

  constructor(private widget: WidgetService) {}

  open(id: string) {
    this.openedId.next(id);
  }

  close() {
    this.openedId.next('');
  }

  toggle(id: string) {
    if (this.getOpenedId() === id) {
      this.close();
    } else {
      this.open(id);
    }
  }

  getOpenedId() {
    return this.openedId.value;
  }

  getOpenedPanel() {
    const id = this.getOpenedId();
    if (!id) return;
    return this.widget.getPanelWidget(id);
  }
}

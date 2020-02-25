import { Service } from 'typedi';
import { BehaviorSubject, empty } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ViewportService, ControlState, mapMouseEventToCanvasPoint } from 'editor/ViewportService';
import { RenderedObjectService } from 'editor/RenderedObjectService';
import { KeybindingService } from 'base/KeybindingService';

@Service()
export class EditorStateService {
  get hovered$() {
    return this.hovered.asObservable();
  }

  get selected$() {
    return this.selected.asObservable();
  }

  private hovered = new BehaviorSubject<string | undefined>(undefined);

  private selected = new BehaviorSubject<string[]>([]);

  private multipleSelecting = false;

  constructor(
    private renderedObject: RenderedObjectService,
    viewport: ViewportService,
    keybinding: KeybindingService
  ) {
    viewport.controlState$
      .pipe(
        switchMap(state => (state === ControlState.Default ? viewport.mousemove$ : empty())),
        mapMouseEventToCanvasPoint(viewport),
        map(point => renderedObject.getFrontest(point)),
        map(object => object?.id)
      )
      .subscribe(this.hovered);

    viewport.controlState$
      .pipe(switchMap(state => (state === ControlState.Default ? viewport.mousedown$ : empty())))
      .subscribe(this.onViewportMouseDown.bind(this));

    keybinding.define({
      id: 'multiple-selecting',
      parts: ['Shift'],
      onEnter: () => this.enableMultipleSelection(true),
      onLeave: () => this.enableMultipleSelection(false),
    });
  }

  enableMultipleSelection(enable: boolean) {
    this.multipleSelecting = enable;
  }

  getHovered() {
    return this.hovered.value;
  }

  addCurrentHovered() {
    const hovered = this.getHovered();
    if (!hovered) return;
    this.selected.next(this.getSelected().concat(hovered));
  }

  addSelected(id: string) {
    const target = this.renderedObject.get(id);
    if (!target) return;
    const currentSelected = this.getSelected();
    // prevent select repeatly
    if (currentSelected.find(objectId => objectId === id)) return;
    this.selected.next(currentSelected.concat(id));
  }

  setSelected(id: string) {
    const target = this.renderedObject.get(id);
    if (!target) return;
    this.selected.next([id]);
  }

  removeSelected(id: string) {
    const selected = this.getSelected();
    const index = selected.findIndex(objectId => objectId === id);
    if (index < 0) return;
    this.selected.next([...selected.slice(0, index), ...selected.slice(index + 1)]);
  }

  getSelected() {
    return this.selected.value;
  }

  clearSelected() {
    this.selected.next([]);
  }

  private onViewportMouseDown() {
    const hovered = this.getHovered();
    if (!hovered) return this.clearSelected();
    if (this.multipleSelecting) {
      this.addSelected(hovered);
    } else {
      this.setSelected(hovered);
    }
  }
}

import { Service } from 'typedi';
import { BehaviorSubject, empty } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ViewportService, ControlState, mapMouseEventToCanvasPoint } from 'editor/ViewportService';
import { RenderedObjectService } from 'editor/RenderedObjectService';

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

  constructor(private renderedObject: RenderedObjectService, viewport: ViewportService) {
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
    this.addSelected(hovered);
  }
}

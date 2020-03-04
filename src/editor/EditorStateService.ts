import { Service } from 'typedi';
import { BehaviorSubject, empty, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MouseService } from 'base/MouseService';
import { ViewportService, ControlState, mapMouseEventToCanvasPoint } from 'editor/ViewportService';
import { ElementService } from 'editor/ElementService';
import { KeybindingService } from 'base/KeybindingService';

@Service()
export class EditorStateService {
  get hovered$() {
    return this.hovered.asObservable();
  }

  get selected$() {
    return this.selected.asObservable();
  }

  get currentScope$() {
    return this.currentScope.asObservable();
  }

  private hovered = new BehaviorSubject<string | undefined>(undefined);

  private selected = new BehaviorSubject<string[]>([]);

  private currentScope = new BehaviorSubject<string | undefined>(undefined);

  private multipleSelecting = false;

  constructor(
    private element: ElementService,
    viewport: ViewportService,
    keybinding: KeybindingService,
    mouse: MouseService
  ) {
    combineLatest(viewport.controlState$, viewport.viewportRect$)
      .pipe(
        switchMap(([state, rect]) =>
          state === ControlState.Default ? mouse.observeRectMove(rect) : empty()
        ),
        mapMouseEventToCanvasPoint(viewport),
        map(point => element.getFrontest(point)),
        map(object => object?.id)
      )
      .subscribe(this.hovered);

    combineLatest(viewport.controlState$, viewport.viewportRect$)
      .pipe(
        switchMap(([state, rect]) =>
          state === ControlState.Default ? mouse.observeRectDown(rect) : empty()
        )
      )
      .subscribe(this.onViewportMouseDown.bind(this));

    keybinding.define({
      id: 'multiple-selecting',
      parts: ['Meta'],
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

  addSelected(id: string) {
    const target = this.element.get(id);
    if (!target) return;
    // multiple selection only support in same scope
    if (target.info.scope !== this.getCurrentScope()) {
      this.clearSelected();
    }
    const currentSelected = this.getSelected();
    // prevent select repeatly
    if (currentSelected.find(objectId => objectId === id)) return;
    this.selected.next([...currentSelected, id]);
    this.setCurrentScope(target.info.scope);
  }

  setSelected(id: string) {
    const target = this.element.get(id);
    if (!target) return;
    this.selected.next([id]);
    this.setCurrentScope(target.info.scope);
  }

  select(id: string) {
    if (this.multipleSelecting) {
      this.addSelected(id);
    } else {
      this.setSelected(id);
    }
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

  setCurrentScope(scope?: string) {
    this.currentScope.next(scope);
  }

  getCurrentScope() {
    return this.currentScope.value;
  }

  private onViewportMouseDown() {
    const hovered = this.getHovered();
    if (!hovered) {
      this.clearSelected();
      this.setCurrentScope();
      return;
    }
    this.select(hovered);
  }
}

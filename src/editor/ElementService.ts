import { Service } from 'typedi';
import { Subscription, combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, map, filter } from 'rxjs/operators';
import { RenderingInfo } from 'gaudi';
import { Initializable, Destroyable, InitializerService } from 'base/LifeCycle';
import { Rect, Vector, Size } from 'base/math';
import { QuadTree } from 'base/QuadTree';
import * as dom from 'base/dom';
import { LoggerService, Logger } from 'base/LoggerService';
import { RectTrackerService, RectChangedEvent } from 'base/RectTrackerService';
import { ViewportService } from 'editor/ViewportService';
import { ViewService } from 'editor/ViewService';
import { ScaffoldId, ElementId } from 'base/id';

interface ElementRectChangeEvent {
  type: 'element-rect-change';
  target: Element;
  rect: Rect;
}

export type ElementEvent = ElementRectChangeEvent;

export interface Element {
  readonly id: ElementId;
  readonly info: RenderingInfo;
  readonly ref: React.RefObject<HTMLElement>;
  readonly scaffoldId: ScaffoldId;
}

@Service()
export class ElementService implements Initializable, Destroyable {
  get event$() {
    return this.event.asObservable();
  }

  private elements = new Map<ElementId, Element>();

  private rootElements = new Set<Element>();

  private rects = new WeakMap<Element, Rect>();

  private tree: QuadTree<Element>;

  private subscriptions: Subscription[] = [];

  private visibleRect = Rect.zero;

  private logger: Logger;

  private event = new Subject<ElementEvent>();

  private requestTrackingVisiblesHandler = 0;

  constructor(
    private rectTracker: RectTrackerService,
    private viewport: ViewportService,
    private view: ViewService,
    logger: LoggerService,
    initializer: InitializerService
  ) {
    this.tree = this.buildTree(Size.zero);
    this.logger = logger.create('RenderedObjectService');
    initializer.register(this);
  }

  initialize() {
    this.subscriptions.push(
      combineLatest(this.viewport.viewportRect$, this.viewport.location$)
        .pipe(
          map(([rect, pos]) => Rect.of(pos, rect.size)),
          distinctUntilChanged(Rect.eq)
        )
        .subscribe(this.onViewportRectChange.bind(this)),
      this.viewport.canvasSize$
        .pipe(debounceTime(100), distinctUntilChanged(Size.eq))
        .subscribe(this.rebuildTree.bind(this)),
      this.rectTracker.rectChanged$.pipe(debounceTime(100)).subscribe(() => this.rebuildTree()),
      this.rectTracker.rectChanged$.subscribe(this.onRectChanged.bind(this))
    );
  }

  destroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    for (const [id] of this.elements) {
      this.rectTracker.untrack(id);
    }
  }

  add(scaffoldId: ScaffoldId, info: RenderingInfo, ref: React.RefObject<HTMLElement>) {
    const id = ElementId.create(info.scope, scaffoldId);
    const element: Element = { id, info, ref, scaffoldId };
    this.elements.set(id, element);
    this.rects.set(element, Rect.zero);
    if (info.depth === 0) this.rootElements.add(element);
    this.tree.insert(element);
    this.trackRect(element); // we don't know whether is it visible yet
    return () => this.remove(id);
  }

  remove(id: ElementId) {
    const element = this.get(id);
    this.rootElements.delete(element);
    this.tree.delete(element);
    this.elements.delete(id);
    this.rectTracker.untrack(id);
  }

  get(id: ElementId) {
    const element = this.elements.get(id);
    if (!element) throw new Error();
    return element;
  }

  getFrontest(point: Vector) {
    const elements = this.findOn(point);
    let frontest: Element | null = null;
    for (const element of elements) {
      if (!frontest) frontest = element;
      else if (element.info.depth > frontest.info.depth) {
        frontest = element;
      }
    }
    return frontest;
  }

  findIn(rect: Rect) {
    return this.tree.findIn(rect);
  }

  findOn(point: Vector) {
    return this.tree.findOn(point);
  }

  getBoundarySize() {
    let width = 0;
    let height = 0;

    for (const element of this.rootElements) {
      const rect = this.rects.get(element) || Rect.zero;
      const rightBottom = rect.position.add(rect.size.width, rect.size.height);
      if (rightBottom.x > width) {
        width = rightBottom.x;
      }
      if (rightBottom.y > height) {
        height = rightBottom.y;
      }
    }

    return Size.of(width, height);
  }

  updateCanvasSize() {
    this.viewport.setCanvasSize(this.getBoundarySize());
  }

  getRect(id: ElementId) {
    const target = this.get(id);
    return this.rects.get(target) || Rect.zero;
  }

  watchRect(id: ElementId) {
    return this.event$.pipe(
      filter(e => e.type === 'element-rect-change' && e.target.id === id),
      map(e => e.rect)
    );
  }

  private requestTrackingVisibles() {
    if (this.requestTrackingVisiblesHandler) {
      return;
    }
    this.requestTrackingVisiblesHandler = window.setTimeout(() => this.trackVisibles(), 100);
  }

  private trackRect(element: Element) {
    this.rectTracker.track(element.id, () => {
      if (!element.ref.current) return Rect.zero;
      const localRect = dom.getRect(element.ref.current);
      const globalPosition = this.view.localToGlobal(element.info.scope, localRect.position);
      return Rect.of(globalPosition, localRect.size);
    });
  }

  private trackVisibles() {
    const visibles = this.tree.findIn(this.visibleRect);

    for (const [id, element] of this.elements) {
      // only tracking elements that visible, rendered and belong to current scope
      if (visibles.has(element) && element.ref) {
        if (this.rectTracker.has(id)) continue;
        this.trackRect(element);
      } else {
        this.rectTracker.untrack(id);
      }
    }

    this.logger.trace('tracking visibles', { count: visibles.size });
    this.requestTrackingVisiblesHandler = 0;
  }

  private onViewportRectChange(rect: Rect) {
    const buffer = rect.size.mul(0.2);
    const pos = rect.position.sub(buffer.width, buffer.height);
    const size = rect.size.add(buffer.mul(2));
    this.visibleRect = Rect.of(pos, size);
    this.requestTrackingVisibles();
  }

  private rebuildTree(size: Size = this.viewport.getCanvasSize()) {
    this.tree = this.buildTree(size);
    this.logger.trace('rebuildTree', { size });
  }

  private onRectChanged({ id, rect }: RectChangedEvent) {
    const target = this.elements.get(id as ElementId);
    if (!target) return;
    this.rects.set(target, rect);
    this.event.next({ type: 'element-rect-change', target, rect });
  }

  private buildTree(canvasSize: Size): QuadTree<Element> {
    const rect = Rect.of(Vector.zero, canvasSize);
    const tree = new QuadTree<Element>(rect, element => this.rects.get(element) || Rect.zero, 100);
    for (const [, element] of this.elements) {
      tree.insert(element);
    }
    return tree;
  }
}

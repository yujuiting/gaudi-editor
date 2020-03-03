import { Service } from 'typedi';
import { Subscription, combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, map, filter } from 'rxjs/operators';
import { RenderingInfo } from 'gaudi';
import { Initializable, Destroyable, InitializerService } from 'base/LifeCycle';
import { Rect, Vector, Size } from 'base/math';
import { QuadTree } from 'base/QuadTree';
import { getRect as getRectFromHTMLElement } from 'base/dom';
import { LoggerService, Logger } from 'base/LoggerService';
import { RectTrackerService, RectChangedEvent } from 'base/RectTrackerService';
import { ViewportService } from 'editor/ViewportService';
import { ViewService } from 'editor/ViewService';

const getElementId = (scope: string, blueprintId: string) => `${scope}-${blueprintId}`;

interface ElementRectChangeEvent {
  type: 'element-rect-change';
  target: Element;
  rect: Rect;
}

export type ElementEvent = ElementRectChangeEvent;

export interface Element {
  readonly id: string;
  readonly info: RenderingInfo;
  readonly ref: React.RefObject<HTMLElement>;
  readonly blueprintId: string;
}

@Service()
export class ElementService implements Initializable, Destroyable {
  get event$() {
    return this.event.asObservable();
  }

  private elements = new Map<string, Element>();

  private rootElements = new Set<Element>();

  private rects = new WeakMap<Element, Rect>();

  private tree: QuadTree<Element>;

  private subscriptions: Subscription[] = [];

  private visibleRect = Rect.zero;

  private logger: Logger;

  private event = new Subject<ElementEvent>();

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
        .subscribe(this.onVisibleRectChanged.bind(this)),
      this.viewport.canvasSize$
        .pipe(debounceTime(100), distinctUntilChanged(Size.eq))
        .subscribe(this.rebuildTree.bind(this)),
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

  add(blueprintId: string, info: RenderingInfo, ref: React.RefObject<HTMLElement>) {
    const id = getElementId(info.scope, blueprintId);
    const element: Element = { id, info, ref, blueprintId };
    this.elements.set(id, element);
    this.rects.set(element, Rect.zero);
    if (info.depth === 0) this.rootElements.add(element);
    this.tree.insert(element);
    /**
     * @FIXME bulk update
     */
    this.trackingVisibles();
    return () => this.remove(id);
  }

  remove(id: string) {
    const element = this.elements.get(id);
    if (element) {
      this.rootElements.delete(element);
      this.tree.delete(element);
    }
    this.elements.delete(id);
    this.rectTracker.untrack(id);
  }

  get(id: string) {
    return this.elements.get(id);
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

  findByBlueprintId(scope: string, blueprintId: string) {
    const id = getElementId(scope, blueprintId);
    return this.get(id);
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

  getRect(id: string) {
    const target = this.elements.get(id);
    if (!target) return Rect.zero;
    return this.rects.get(target) || Rect.zero;
  }

  watchRect(id: string) {
    return this.event$.pipe(
      filter(e => e.type === 'element-rect-change' && e.target.id === id),
      map(e => e.rect)
    );
  }

  private trackingVisibles() {
    const visibles = this.tree.findIn(this.visibleRect);

    for (const [id, element] of this.elements) {
      // only tracking elements that visible, rendered and belong to current scope
      if (visibles.has(element) && element.ref) {
        this.rectTracker.track(id, () => {
          if (!element.ref.current) return Rect.zero;
          const localRect = getRectFromHTMLElement(element.ref.current);
          const globalPosition = this.view.localToGlobal(element.info.scope, localRect.position);
          return Rect.of(globalPosition, localRect.size);
        });
      } else {
        this.rectTracker.untrack(id);
      }
    }

    this.logger.trace('tracking visibles', { count: visibles.size });
  }

  private onVisibleRectChanged(rect: Rect) {
    const buffer = rect.size.mul(0.2);
    const pos = rect.position.sub(buffer.width, buffer.height);
    const size = rect.size.add(buffer);
    this.visibleRect = Rect.of(pos, size);
    this.trackingVisibles();
  }

  private rebuildTree(size: Size) {
    this.tree = this.buildTree(size);
  }

  private onRectChanged({ id, rect }: RectChangedEvent) {
    const target = this.elements.get(id as string);
    if (!target) {
      return;
    }

    const nodes = this.tree.findNodes(target);

    // delete from tree before updating rect
    for (const node of nodes) {
      node.delete(target);
    }

    this.rects.set(target, rect);
    this.tree.insert(target);

    if (target.info.depth === 0) {
      // this.updateCanvasSize();
    }

    this.event.next({ type: 'element-rect-change', target, rect });
  }

  private buildTree(canvasSize: Size): QuadTree<Element> {
    const rect = Rect.of(Vector.zero, canvasSize);
    const tree = new QuadTree<Element>(rect, obj => this.rects.get(obj) || Rect.zero);
    for (const [, ve] of this.elements) {
      tree.insert(ve);
    }
    return tree;
  }
}

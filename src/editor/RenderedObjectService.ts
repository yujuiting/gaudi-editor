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

interface RenderedObjectRectChangeEvent {
  type: 'rendered-object-rect-change';
  target: RenderedObject;
  rect: Rect;
}

export type RenderedObjectEvent = RenderedObjectRectChangeEvent;

export interface RenderedObject {
  readonly id: string;
  readonly info: RenderingInfo;
  readonly ref: React.MutableRefObject<HTMLElement | undefined>;
}

@Service()
export class RenderedObjectService implements Initializable, Destroyable {
  get event$() {
    return this.event.asObservable();
  }

  private renderedObjects = new Map<string, RenderedObject>();

  private rootRenderedObjects = new Set<RenderedObject>();

  private rects = new WeakMap<RenderedObject, Rect>();

  private tree: QuadTree<RenderedObject>;

  private subscriptions: Subscription[] = [];

  private visibleRect = Rect.zero;

  private logger: Logger;

  private event = new Subject<RenderedObjectEvent>();

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
      combineLatest(this.viewport.viewportSize$, this.viewport.location$)
        .pipe(
          map(([size, pos]) => Rect.of(pos, size)),
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
    for (const [id] of this.renderedObjects) {
      this.rectTracker.untrack(id);
    }
  }

  add(id: string, info: RenderingInfo, ref: React.MutableRefObject<HTMLElement | undefined>) {
    const obj: RenderedObject = { id, info, ref };
    this.renderedObjects.set(id, obj);
    this.rects.set(obj, Rect.zero);
    if (info.depth === 0) this.rootRenderedObjects.add(obj);
    this.tree.insert(obj);
    /**
     * @FIXME bulk update
     */
    this.trackingVisibles();
    return () => this.remove(id);
  }

  remove(id: string) {
    const renderedObject = this.renderedObjects.get(id);
    if (renderedObject) {
      this.rootRenderedObjects.delete(renderedObject);
      this.tree.delete(renderedObject);
    }
    this.renderedObjects.delete(id);
    this.rectTracker.untrack(id);
  }

  get(id: string) {
    return this.renderedObjects.get(id);
  }

  getRoots(): ReadonlySet<RenderedObject> {
    return this.rootRenderedObjects;
  }

  getFrontest(point: Vector) {
    const objects = this.findOn(point);
    let frontest: RenderedObject | null = null;
    for (const object of objects) {
      if (!frontest) frontest = object;
      else if (object.info.depth > frontest.info.depth) {
        frontest = object;
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

    for (const obj of this.rootRenderedObjects) {
      const rect = this.rects.get(obj) || Rect.zero;
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
    const target = this.renderedObjects.get(id);
    if (!target) return Rect.zero;
    return this.rects.get(target) || Rect.zero;
  }

  watchRect(id: string) {
    return this.event$.pipe(
      filter(e => e.type === 'rendered-object-rect-change' && e.target.id === id),
      map(e => e.rect)
    );
  }

  private trackingVisibles() {
    const visibles = this.tree.findIn(this.visibleRect);

    for (const [id, renderedObject] of this.renderedObjects) {
      // only tracking elements that visible, rendered and belong to current scope
      if (visibles.has(renderedObject) && renderedObject.ref) {
        this.rectTracker.track(id, () => {
          if (!renderedObject.ref.current) return Rect.zero;
          const localRect = getRectFromHTMLElement(renderedObject.ref.current);
          const globalPosition = this.view.localToGlobal(
            renderedObject.info.scope,
            localRect.position
          );
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
    this.logger.trace('on visible rect changed', { pos, size });
    this.visibleRect = Rect.of(pos, size);
    this.trackingVisibles();
  }

  private rebuildTree(size: Size) {
    this.tree = this.buildTree(size);
    this.logger.trace('tree rebuilt');
  }

  private onRectChanged({ id, rect }: RectChangedEvent) {
    const target = this.renderedObjects.get(id as string);
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

    this.logger.trace('rect change', { id, rect: rect.toString() });

    this.event.next({ type: 'rendered-object-rect-change', target, rect });
  }

  private buildTree(canvasSize: Size): QuadTree<RenderedObject> {
    const rect = Rect.of(Vector.zero, canvasSize);
    const tree = new QuadTree<RenderedObject>(rect, obj => this.rects.get(obj) || Rect.zero);
    for (const [, ve] of this.renderedObjects) {
      tree.insert(ve);
    }
    return tree;
  }
}

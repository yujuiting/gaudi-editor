import { Service } from 'typedi';
import { Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, debounceTime, throttleTime, map } from 'rxjs/operators';
import { RenderingInfo } from 'gaudi';
import { Initializable, Destroyable } from 'base/LifeCycle';
import { Rect, Vector, Size } from 'base/math';
import { QuadTree } from 'base/QuadTree';
import { getRect as getRectFromHTMLElement } from 'base/dom';
import { LoggerService, Logger } from 'base/LoggerService';
import { RectTrackerService, RectChangedEvent } from 'base/RectTrackerService';
import { ViewportService } from 'editor/viewport/ViewportService';

export interface RenderedObject {
  id: string;
  readonly info: RenderingInfo;
  rect: Rect;
  ref: React.MutableRefObject<HTMLElement | undefined>;
}

const getRectFromElement = (e: RenderedObject) => e.rect;

function buildTree(
  canvasSize: Size,
  elements: Map<string, RenderedObject>
): QuadTree<RenderedObject> {
  const rect = Rect.of(Vector.zero, canvasSize);
  const tree = new QuadTree<RenderedObject>(rect, getRectFromElement);
  for (const [, ve] of elements) {
    tree.insert(ve);
  }
  return tree;
}

@Service()
export class RenderedObjectService implements Initializable, Destroyable {
  private renderedObjects = new Map<string, RenderedObject>();

  private rootRenderedObjects = new Set<RenderedObject>();

  private tree: QuadTree<RenderedObject>;

  private subscriptions: Subscription[] = [];

  private visibleRect = Rect.zero;

  private logger: Logger;

  constructor(
    private rectTracker: RectTrackerService,
    private viewport: ViewportService,
    logger: LoggerService
  ) {
    this.tree = buildTree(Size.zero, this.renderedObjects);
    this.logger = logger.create('ViewElementService');
  }

  initialize() {
    this.subscriptions.push(
      combineLatest(this.viewport.viewportSize$, this.viewport.location$)
        .pipe(
          map(([size, pos]) => Rect.of(pos, size)),
          throttleTime(100),
          distinctUntilChanged(Rect.eq)
        )
        .subscribe(this.onVisibleRectChanged.bind(this)),
      this.viewport.canvasSize$
        .pipe(debounceTime(100), distinctUntilChanged(Size.eq))
        .subscribe(this.onCanvasSizeChanged.bind(this)),
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
    const renderedObject: RenderedObject = { id, info, ref, rect: Rect.zero };
    this.renderedObjects.set(id, renderedObject);
    if (info.depth === 0) this.rootRenderedObjects.add(renderedObject);
    return () => this.remove(id);
  }

  remove(id: string) {
    const renderedObject = this.renderedObjects.get(id);
    if (renderedObject) this.rootRenderedObjects.delete(renderedObject);
    this.renderedObjects.delete(id);
    this.rectTracker.untrack(id);
  }

  get(id: string) {
    return this.renderedObjects.get(id);
  }

  getRoots(): ReadonlySet<RenderedObject> {
    return this.rootRenderedObjects;
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

    for (const renderedObject of this.rootRenderedObjects) {
      const { rect } = this.renderedObjects.get(renderedObject.id)!;
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

  private trackingVisibles() {
    const visibles = this.tree.findIn(this.visibleRect);
    for (const [id, viewElement] of this.renderedObjects) {
      // only tracking elements that visible, rendered and belong to current scope
      if (visibles.has(viewElement) && viewElement.ref) {
        this.rectTracker.track(id, () =>
          viewElement.ref.current ? getRectFromHTMLElement(viewElement.ref.current) : Rect.zero
        );
      } else {
        this.rectTracker.untrack(id);
      }
    }
  }

  private onVisibleRectChanged(rect: Rect) {
    const buffer = rect.size.mul(0.2);
    const pos = rect.position.sub(buffer.width, buffer.height);
    const size = rect.size.add(buffer);
    this.visibleRect = Rect.of(pos, size);
    this.trackingVisibles();
  }

  private onCanvasSizeChanged(size: Size) {
    this.tree = buildTree(size, this.renderedObjects);
  }

  private onRectChanged({ id, rect }: RectChangedEvent) {
    const element = this.renderedObjects.get(id as string);
    if (!element) {
      this.logger.warn('not found view element', { id });
      return;
    }

    const nodes = this.tree.findNodes(element);

    // delete from tree before updating rect
    for (const node of nodes) {
      node.delete(element);
    }

    // offset to canvas coordinate
    const posInCanvas = this.viewport.pageToCanvasPoint(rect.position);
    element.rect = Rect.of(posInCanvas, rect.size);
    this.tree.insert(element);

    if (element.info.depth === 0) {
      this.updateCanvasSize();
    }
  }
}

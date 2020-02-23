import { Service } from 'typedi';
import { fromEvent, BehaviorSubject, Subscription, Subject } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { Destroyable, InitializerService } from 'base/LifeCycle';
import { getRect } from 'base/dom';
import { Vector, Size, clamp, fixPrecision, Rect } from 'base/math';
import { KeybindingService } from 'base/KeybindingService';
import { RectTrackerService } from 'base/RectTrackerService';
import { LoggerService, Logger } from 'base/LoggerService';

export enum ControlState {
  Default = 'Default',
  CanPan = 'CanPan',
  CanPinch = 'CanPinch',
  Panning = 'Panning',
  ZoomingIn = 'ZoomingIn',
  ZoomingOut = 'ZoomingOut',
}

export const VIEWPORT_SCALE_PRECISION = 4;

export const MIN_VIEWPORT_SCALE = 0.5;

export const MAX_VIEWPORT_SCALE = 8;

@Service()
export class ViewportService implements Destroyable {
  get controlState$() {
    return this.controlState.asObservable();
  }

  get scale$() {
    return this.scale.asObservable();
  }

  get location$() {
    return this.location.asObservable();
  }

  get canvasSize$() {
    return this.canvasSize.asObservable();
  }

  get viewportSize$() {
    return this.viewportSize.asObservable();
  }

  get mousedown$() {
    return this.mousedown.asObservable();
  }

  get mouseup$() {
    return this.mouseup.asObservable();
  }

  get mousemove$() {
    return this.mousemove.asObservable();
  }

  get mousedrag$() {
    return this.mousedrag.asObservable();
  }

  private controlState = new BehaviorSubject(ControlState.Default);

  private scale = new BehaviorSubject(1);

  private location = new BehaviorSubject(Vector.zero);

  private canvasSize = new BehaviorSubject(Size.of(2000, 2000));

  private viewportSize = new BehaviorSubject(Size.zero);

  private viewportCenter = Vector.zero;

  private mousedown = new Subject<MouseEvent>();

  private mouseup = new Subject<MouseEvent>();

  private mousemove = new Subject<MouseEvent>();

  private mousedrag = new Subject<MouseEvent>();

  /**
   * in page coordinate
   */
  private lastMouseLocation = Vector.zero;

  private target: HTMLElement | null = null;

  private onMouseDown = (e: MouseEvent) => {
    if (this.getControlState() !== ControlState.CanPan) {
      return;
    }

    this.lastMouseLocation = Vector.of(e.pageX, e.pageY);
  };

  private onMouseUp = () => {
    if (this.getControlState() !== ControlState.Panning) {
      return;
    }

    this.setControlState(ControlState.CanPan);
  };

  private onDrag = (e: MouseEvent) => {
    switch (this.getControlState()) {
      case ControlState.CanPan:
      case ControlState.Panning:
        break;
      default:
        return;
    }
    this.setControlState(ControlState.Panning);
    const current = Vector.of(e.pageX, e.pageY);
    const delta = current.sub(this.lastMouseLocation);
    this.pan(delta);
    this.lastMouseLocation = current;
  };

  private onWheel = (e: WheelEvent) => {
    switch (this.getControlState()) {
      case ControlState.CanPinch:
      case ControlState.ZoomingIn:
      case ControlState.ZoomingOut:
        break;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    const current = Vector.of(e.pageX, e.pageY);
    this.zoom(e.deltaY * 0.01, current);

    if (e.deltaY > 0) {
      this.setControlState(ControlState.ZoomingIn);
    } else {
      this.setControlState(ControlState.ZoomingOut);
    }
  };

  private subscriptions: Subscription[] = [];

  private logger: Logger;

  constructor(
    keybindingService: KeybindingService,
    logger: LoggerService,
    initializer: InitializerService,
    private rectTracker: RectTrackerService
  ) {
    this.logger = logger.create('ViewportService');

    keybindingService.define({
      id: 'pan',
      parts: ['Space'],
      onEnter: () => this.setControlState(ControlState.CanPan),
      onLeave: () => this.setControlState(ControlState.Default),
    });

    keybindingService.define({
      id: 'pinch',
      parts: ['MetaLeft'],
      onEnter: () => this.setControlState(ControlState.CanPinch),
      onLeave: () => this.setControlState(ControlState.Default),
    });

    initializer.register(this);
  }

  destroy() {
    this.unbind();
  }

  bind(target: HTMLElement) {
    if (this.target !== target) {
      this.unbind();
    }

    this.logger.info('bind to target');

    this.target = target;

    const mousedown$ = fromEvent<MouseEvent>(target, 'mousedown');
    const mouseup$ = fromEvent<MouseEvent>(window, 'mouseup');
    const mousemove$ = fromEvent<MouseEvent>(window, 'mousemove');
    const wheel$ = fromEvent<WheelEvent>(target, 'wheel', { passive: false, capture: true });

    this.subscriptions.push(
      mousedown$.subscribe(this.mousedown),
      mouseup$.subscribe(this.mouseup),
      mousemove$.subscribe(this.mousemove),
      mousedown$
        .pipe(switchMap(() => mousemove$.pipe(takeUntil(mouseup$))))
        .subscribe(this.mousedrag),
      this.mousedown.subscribe(this.onMouseDown),
      mouseup$.subscribe(this.onMouseUp), // bind to window
      this.mousedrag.subscribe(this.onDrag),
      wheel$.subscribe(this.onWheel),
      this.rectTracker
        .observe('viewport')
        .pipe(map(e => e.rect.size))
        .subscribe(this.viewportSize)
    );

    const { width, height } = target.getBoundingClientRect();
    this.viewportCenter = Vector.of(width / 2, height / 2);

    this.rectTracker.track('viewport', () => getRect(target));

    return true;
  }

  unbind() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.target = null;
    this.rectTracker.untrack('viewport');
  }

  setControlState(controlState: ControlState) {
    if (this.getControlState() === controlState) {
      return;
    }
    this.controlState.next(controlState);
  }

  getControlState() {
    return this.controlState.value;
  }

  getCanvasSize() {
    return this.canvasSize.value;
  }

  setCanvasSize(size: Size) {
    this.canvasSize.next(size);
  }

  /**
   * set location in canvas coordinate
   */
  setLocation(location: Vector) {
    const nextLocation = location.fixPrecision();
    if (this.getLocation().eq(nextLocation)) {
      return;
    }
    this.location.next(nextLocation);
  }

  /**
   * get location in canvas coordinate
   */
  getLocation() {
    return this.location.value;
  }

  setScale(scale: number) {
    const nextScale = fixPrecision(
      clamp(scale, MIN_VIEWPORT_SCALE, MAX_VIEWPORT_SCALE),
      VIEWPORT_SCALE_PRECISION
    );
    if (this.getScale() === nextScale) {
      return;
    }
    this.scale.next(nextScale);
  }

  getScale() {
    return this.scale.value;
  }

  pan(viewportDelta: Vector) {
    const canvasDelta = this.toCanvasVector(viewportDelta);
    this.setLocation(this.getLocation().add(canvasDelta));
  }

  zoom(delta: number, pivot = this.viewportCenter) {
    const scale = this.getScale();

    if (delta > 0 && scale >= MAX_VIEWPORT_SCALE) {
      return;
    }

    if (delta < 0 && scale <= MIN_VIEWPORT_SCALE) {
      return;
    }

    const canvasPivot = this.toCanvasPoint(pivot);
    this.setScale(scale + delta);
    const location = this.toCanvasVector(pivot).sub(canvasPivot);
    this.setLocation(location);
  }

  pageToViewportPoint(p: Vector) {
    if (!this.target) return p;
    const { x, y } = this.target.getBoundingClientRect();
    return p.sub(x, y);
  }

  pageToCanvasPoint(p: Vector) {
    const viewportPoint = this.pageToViewportPoint(p);
    return this.toCanvasPoint(viewportPoint);
  }

  toCanvasVector(v: Vector) {
    return v.mul(1 / this.getScale());
  }

  toCanvasPoint(p: Vector) {
    return this.toCanvasVector(p).sub(this.getLocation());
  }

  toCanvasRect(rect: Rect) {
    return Rect.of(this.toCanvasPoint(rect.position), rect.size.mul(1 / this.getScale()));
  }

  toViewportVector(v: Vector) {
    return v.mul(this.getScale());
  }

  toViewportPoint(point: Vector) {
    return this.toViewportVector(point.add(this.getLocation()));
  }

  /**
   * transform position and size
   */
  toViewportRect(rect: Rect) {
    return Rect.of(this.toViewportPoint(rect.position), rect.size.mul(this.getScale()));
  }
}

export function mapMouseEventToCanvasPoint(viewport: ViewportService) {
  return map<MouseEvent, Vector>(e => viewport.pageToCanvasPoint(Vector.of(e.pageX, e.pageY)));
}

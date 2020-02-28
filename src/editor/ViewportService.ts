import { Service } from 'typedi';
import { BehaviorSubject, Subscription } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';
import { FSM } from 'base/FSM';
import { Destroyable, InitializerService } from 'base/LifeCycle';
import { getRect } from 'base/dom';
import { Vector, Size, clamp, fixPrecision, Rect } from 'base/math';
import { MouseService } from 'base/MouseService';
import { KeybindingService } from 'base/KeybindingService';
import { RectTrackerService } from 'base/RectTrackerService';
import { LoggerService, Logger } from 'base/LoggerService';

export enum ControlState {
  Default = 'Default',
  CanPan = 'CanPan',
  CanZoom = 'CanZoom',
  Panning = 'Panning',
  ZoomingIn = 'ZoomingIn',
  ZoomingOut = 'ZoomingOut',
}

interface ControlData {
  panning?: Subscription;
  zooming?: Subscription;
  lastMouseLocation: Vector;
}

export const VIEWPORT_SCALE_PRECISION = 4;

export const MIN_VIEWPORT_SCALE = 0.5;

export const MAX_VIEWPORT_SCALE = 8;

@Service()
export class ViewportService implements Destroyable {
  get controlState$() {
    return this.control.current$;
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

  get viewportRect$() {
    return this.viewportRect.asObservable();
  }

  private control: FSM<ControlState, ControlData>;

  private scale = new BehaviorSubject(1);

  private location = new BehaviorSubject(Vector.zero);

  private canvasSize = new BehaviorSubject(Size.of(2000, 2000));

  private viewportRect = new BehaviorSubject(Rect.zero);

  private target: HTMLElement | null = null;

  private subscriptions: Subscription[] = [];

  private logger: Logger;

  constructor(
    private mouse: MouseService,
    private rectTracker: RectTrackerService,
    keybinding: KeybindingService,
    logger: LoggerService,
    initializer: InitializerService
  ) {
    this.logger = logger.create('ViewportService');

    this.control = new FSM<ControlState, ControlData>(
      [
        {
          name: ControlState.Default,
          next: [ControlState.CanPan, ControlState.CanZoom],
          onEnter: ({ data }) => {
            if (data.panning) {
              data.panning.unsubscribe();
              data.panning = undefined;
            }
            if (data.zooming) {
              data.zooming.unsubscribe();
              data.zooming = undefined;
            }
          },
        },
        {
          name: ControlState.CanPan,
          next: [ControlState.Panning, ControlState.Default],
          onEnter: ({ data }) => {
            if (!this.target) return;

            data.lastMouseLocation = mouse.getLocation();

            const drag = this.mouse.observeDown(this.getViewportRect()).pipe(
              switchMap(() => this.mouse.observeMove(this.getViewportRect())),
              takeUntil(this.mouse.up$)
            );

            data.panning = drag.subscribe(e => {
              const current = Vector.of(e.pageX, e.pageY);
              const delta = current.sub(data.lastMouseLocation);
              this.pan(delta);
              data.lastMouseLocation = current;
            });
          },
        },
        {
          name: ControlState.Panning,
          next: [ControlState.CanPan, ControlState.Default],
        },
        {
          name: ControlState.CanZoom,
          next: [ControlState.ZoomingIn, ControlState.ZoomingOut, ControlState.Default],
          onEnter: e => {
            if (!this.target) return;

            e.data.zooming = this.mouse.observeWheel(this.getViewportRect()).subscribe(e => {
              e.preventDefault();
              e.stopPropagation();
              const current = Vector.of(e.pageX, e.pageY);
              this.zoom(e.deltaY * 0.01, current);

              if (e.deltaY > 0) {
                this.control.transit(ControlState.ZoomingIn);
              } else {
                this.control.transit(ControlState.ZoomingOut);
              }
            });
          },
        },
        {
          name: ControlState.ZoomingIn,
          next: [ControlState.CanZoom, ControlState.ZoomingOut, ControlState.Default],
        },
        {
          name: ControlState.ZoomingOut,
          next: [ControlState.CanZoom, ControlState.ZoomingIn, ControlState.Default],
        },
      ],
      ControlState.Default,
      { lastMouseLocation: Vector.zero }
    );

    keybinding.define({
      id: 'pan',
      parts: ['Space'],
      onEnter: () => this.control.transit(ControlState.CanPan),
      onLeave: () => this.control.transit(ControlState.Default),
    });

    keybinding.define({
      id: 'pinch',
      parts: ['Alt'],
      onEnter: () => this.control.transit(ControlState.CanZoom),
      onLeave: () => this.control.transit(ControlState.Default),
    });

    initializer.register(this);
  }

  destroy() {
    this.unbind();
  }

  bind(target: HTMLElement) {
    if (this.target) this.unbind();

    this.logger.info('bind to target');

    this.target = target;

    this.subscriptions.push(
      this.rectTracker
        .observe('viewport')
        .pipe(map(e => e.rect))
        .subscribe(this.viewportRect)
    );

    this.rectTracker.track('viewport', () => getRect(target));

    return true;
  }

  unbind() {
    if (!this.target) return;
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.target = null;
    this.rectTracker.untrack('viewport');
  }

  getControlState() {
    return this.control.getCurrent();
  }

  getCanvasSize() {
    return this.canvasSize.value;
  }

  setCanvasSize(size: Size) {
    this.canvasSize.next(size);
  }

  getViewportRect() {
    return this.viewportRect.value;
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

  zoom(delta: number, pivot: Vector) {
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

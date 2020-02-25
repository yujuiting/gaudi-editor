import { Service } from 'typedi';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Initializable, Destroyable, InitializerService } from 'base/LifeCycle';
import { Rect } from 'base/math';
import { LoggerService, Logger } from 'base/LoggerService';

export interface RectChangedEvent {
  id: unknown;
  rect: Rect;
  prevRect: Rect;
}

interface TrackingData {
  getRect: () => Rect;
  prevRect: Rect;
}

@Service()
export class RectTrackerService implements Initializable, Destroyable {
  get rectChanged$() {
    return this.rectChanged.asObservable();
  }

  private handle = 0;

  private trackings = new Map<unknown, TrackingData>();

  private tracking = false;

  private rectChanged = new Subject<RectChangedEvent>();

  private waitings = Array.from(this.trackings.entries());

  private requestIdleCallbackOptions: RequestIdleCallbackOptions = { timeout: 20 };

  private logger: Logger;

  constructor(logger: LoggerService, initializer: InitializerService) {
    this.logger = logger.create('RectTracker');
    this.updateAll = this.updateAll.bind(this);
    initializer.register(this);
  }

  initialize() {
    this.start();
  }

  destroy() {
    this.stop();
  }

  start() {
    if (this.tracking) {
      return;
    }
    this.tracking = true;
    this.requestNextUpdate();
  }

  stop() {
    this.tracking = false;
    if (this.handle) {
      window.cancelIdleCallback(this.handle);
    }
  }

  observe(id: unknown) {
    return this.rectChanged$.pipe(filter(rce => rce.id === id));
  }

  track(id: unknown, getRect: () => Rect) {
    const trackingData: TrackingData = { getRect, prevRect: Rect.zero };
    this.trackings.set(id, trackingData);
    this.update(id, trackingData);
  }

  untrack(id: unknown) {
    const trackingData = this.trackings.get(id);
    if (!trackingData) {
      return;
    }
    this.trackings.delete(id);
  }

  forceUpdate(id: unknown) {
    const trackingData = this.trackings.get(id);
    if (!trackingData) return;
    this.update(id, trackingData);
  }

  private changeRect(id: unknown, trackingData: TrackingData, rect: Rect) {
    const prevRect = trackingData.prevRect;
    this.rectChanged.next({ id, rect, prevRect });
    trackingData.prevRect = rect;
    this.logger.trace(`${id} rect updated, ${rect}`);
  }

  private update(id: unknown, trackingData: TrackingData) {
    const nextRect = trackingData.getRect();
    const prevRect = trackingData.prevRect;

    if (!nextRect.eq(prevRect)) {
      this.changeRect(id, trackingData, nextRect);
    }
  }

  private updateAll(deadline: RequestIdleCallbackDeadline) {
    if (this.waitings.length === 0) {
      this.waitings = Array.from(this.trackings.entries());
    }

    let current = this.waitings.shift();

    while ((deadline.timeRemaining() > 0 || !deadline.didTimeout) && current) {
      // it may be untracked
      if (this.trackings.has(current)) {
        const [id, data] = current;
        this.update(id, data);
      }
      current = this.waitings.shift();
    }

    this.handle = 0;

    this.requestNextUpdate();
  }

  private requestNextUpdate() {
    if (this.handle) {
      return;
    }
    if (this.tracking) {
      this.handle = window.requestIdleCallback(this.updateAll, this.requestIdleCallbackOptions);
    }
  }
}

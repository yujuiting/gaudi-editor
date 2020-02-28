import { Service } from 'typedi';
import { fromEvent, Subject, Subscription, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Rect, Vector } from 'base/math';

function getPagePoint(e: MouseEvent) {
  return Vector.of(e.pageX, e.pageY);
}

interface Draggable {
  target: HTMLElement;
}

@Service()
export class MouseService {
  get down$() {
    return this.down.asObservable();
  }

  get up$() {
    return this.up.asObservable();
  }

  get move$() {
    return this.move.asObservable();
  }

  get wheel$() {
    return this.wheel.asObservable();
  }

  get location$() {
    return this.location.asObservable();
  }

  private down = new Subject<MouseEvent>();

  private up = new Subject<MouseEvent>();

  private move = new Subject<MouseEvent>();

  private wheel = new Subject<WheelEvent>();

  private location = new BehaviorSubject(Vector.zero);

  private target: HTMLElement | null = null;

  private subscriptions: Subscription[] = [];

  bind(target: Window | HTMLElement) {
    if (this.target) this.unbind();
    const options = { passive: false, capture: true };
    this.subscriptions.push(
      fromEvent<MouseEvent>(target, 'mousedown', options).subscribe(this.down),
      fromEvent<MouseEvent>(target, 'mouseup', options).subscribe(this.up),
      fromEvent<MouseEvent>(target, 'mousemove', options).subscribe(this.move),
      fromEvent<WheelEvent>(target, 'wheel', options).subscribe(this.wheel),
      this.move.pipe(map(getPagePoint)).subscribe(this.location)
    );
  }

  getLocation() {
    return this.location.value;
  }

  unbind() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.target = null;
  }

  observeDown(pageRect: Rect) {
    return this.down.pipe(filter(e => pageRect.contains(getPagePoint(e))));
  }

  observeUp(pageRect: Rect) {
    return this.up.pipe(filter(e => pageRect.contains(getPagePoint(e))));
  }

  observeMove(pageRect: Rect) {
    return this.move.pipe(filter(e => pageRect.contains(getPagePoint(e))));
  }

  observeWheel(pageRect: Rect) {
    return this.wheel.pipe(filter(e => pageRect.contains(getPagePoint(e))));
  }
}

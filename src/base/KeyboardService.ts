import { Service } from 'typedi';
import { Subject, fromEvent, Subscription } from 'rxjs';

@Service()
export class KeyboardService {
  get keydown$() {
    return this.keydown.asObservable();
  }

  get keyup$() {
    return this.keyup.asObservable();
  }

  private target: Window | HTMLElement | null = null;

  private keydown = new Subject<KeyboardEvent>();

  private keyup = new Subject<KeyboardEvent>();

  private subscriptions: Subscription[] = [];

  bind(target: Window | HTMLElement) {
    if (this.target !== target) {
      this.unbind();
    }

    this.target = target;

    const options: AddEventListenerOptions = { capture: true, passive: true };

    this.subscriptions.push(
      fromEvent<KeyboardEvent>(target, 'keydown', options).subscribe(this.keydown),
      fromEvent<KeyboardEvent>(target, 'keyup', options).subscribe(this.keyup)
    );
  }

  unbind() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.target = null;
  }
}

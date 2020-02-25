import { Service } from 'typedi';
import { Subject, fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

function excludeByTagNames(tagNames: string[]) {
  return filter<KeyboardEvent>(e => {
    if (!e.target) return true;
    const tagName = (e.target as HTMLElement).tagName;
    if (!tagName) return true;
    return !tagNames.includes(tagName);
  });
}

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

    const options: AddEventListenerOptions = { capture: false, passive: false };

    this.subscriptions.push(
      fromEvent<KeyboardEvent>(target, 'keydown', options)
        .pipe(excludeByTagNames(['INPUT', 'TEXTAREA']))
        .subscribe(this.keydown),
      fromEvent<KeyboardEvent>(target, 'keyup', options)
        .pipe(excludeByTagNames(['INPUT', 'TEXTAREA']))
        .subscribe(this.keyup)
    );
  }

  unbind() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.target = null;
  }
}

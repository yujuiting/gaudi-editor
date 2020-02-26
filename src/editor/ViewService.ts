import { Service } from 'typedi';
import { Subject } from 'rxjs';
import { Rect, Size, Vector } from 'base/math';
import { startWith, filter, map } from 'rxjs/operators';

export interface View {
  scope: string;
  // canvas coordinate
  rect: Rect;
}

const defaultViewSize = Size.of(500, 500);
const viewGap = 32;

@Service()
export class ViewService {
  get viewUpdated$() {
    return this.viewUpdated.asObservable();
  }

  private views: View[] = [];

  private viewUpdated = new Subject<Readonly<View>>();

  create(scope: string) {
    const rect = Rect.of(this.getNextViewLocation(), defaultViewSize);
    const view: View = { scope: scope, rect };
    this.views.push(view);
  }

  destroy(scope: string) {
    const index = this.views.findIndex(view => view.scope === scope);
    if (index > 0) this.views.splice(index, 1);
  }

  get(scope: string) {
    const view = this.views.find(view => view.scope === scope);
    if (!view) return null;
    return { ...view } as const;
  }

  updateRect(scope: string, rect: Rect) {
    const view = this.views.find(view => view.scope === scope);
    if (!view) throw new Error();
    view.rect = rect;
    this.viewUpdated.next(view);
  }

  resize(scope: string, delta: Size) {
    const view = this.views.find(view => view.scope === scope);
    if (!view) throw new Error();
    view.rect = view.rect.setSize(view.rect.size.add(delta));
    this.viewUpdated.next(view);
  }

  move(scope: string, delta: Vector) {
    const view = this.views.find(view => view.scope === scope);
    if (!view) throw new Error();
    view.rect = view.rect.setPosition(view.rect.position.add(delta));
    this.viewUpdated.next(view);
  }

  getNextViewLocation() {
    let maxRight = 0;

    for (const view of this.views) {
      const right = view.rect.position.x + view.rect.size.width;
      if (right > maxRight) maxRight = right;
    }

    return Vector.of(maxRight + viewGap, viewGap);
  }

  /**
   * from local (inside view) to global (canvas coordinate)
   */
  localToGlobal(scope: string, p: Vector) {
    const view = this.get(scope);
    if (!view) return p;
    return p.add(view.rect.position);
  }

  globalToLocal(scope: string, p: Vector) {
    const view = this.get(scope);
    if (!view) return p;
    return p.sub(view.rect.position);
  }

  watchRect(scope: string) {
    return this.viewUpdated$.pipe(
      filter(view => view.scope === scope),
      startWith(this.get(scope)),
      map(view => view?.rect || Rect.zero)
    );
  }
}

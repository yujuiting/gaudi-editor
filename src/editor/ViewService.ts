import { Service } from 'typedi';
import { Subject } from 'rxjs';
import { Rect, Size, Vector } from 'base/math';
import { startWith, filter, map } from 'rxjs/operators';
import { ScopeService } from 'editor/scope/ScopeService';

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

  constructor(scope: ScopeService) {
    scope.created$.subscribe(e => this.create(e.scope.name));
    scope.destroyed$.subscribe(e => this.destroy(e.scope.name));
  }

  create(scopeName: string) {
    const rect = Rect.of(this.getNextViewLocation(), defaultViewSize);
    const view: View = { scope: scopeName, rect };
    this.views.push(view);
  }

  destroy(scopeName: string) {
    const index = this.views.findIndex(view => view.scope === scopeName);
    if (index > 0) this.views.splice(index, 1);
  }

  get(scopeName: string) {
    const view = this.views.find(view => view.scope === scopeName);
    if (!view) return null;
    return { ...view } as const;
  }

  updateRect(scopeName: string, rect: Rect) {
    const view = this.views.find(view => view.scope === scopeName);
    if (!view) throw new Error();
    view.rect = rect;
    this.viewUpdated.next(view);
  }

  resize(scopeName: string, delta: Size) {
    const view = this.views.find(view => view.scope === scopeName);
    if (!view) throw new Error();
    view.rect = view.rect.setSize(view.rect.size.add(delta));
    this.viewUpdated.next(view);
  }

  move(scopeName: string, delta: Vector) {
    const view = this.views.find(view => view.scope === scopeName);
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
  localToGlobal(scopeName: string, p: Vector) {
    const view = this.get(scopeName);
    if (!view) return p;
    return p.add(view.rect.position);
  }

  globalToLocal(scopeName: string, p: Vector) {
    const view = this.get(scopeName);
    if (!view) return p;
    return p.sub(view.rect.position);
  }

  watchRect(scopeName: string) {
    return this.viewUpdated$.pipe(
      filter(view => view.scope === scopeName),
      startWith(this.get(scopeName)),
      map(view => view?.rect || Rect.zero)
    );
  }
}

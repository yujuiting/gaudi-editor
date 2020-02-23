import { Service } from 'typedi';
import { Rect, Size, Vector } from 'base/math';

export interface View {
  scope: string;
  // canvas coordinate
  rect: Rect;
}

const defaultViewSize = Size.of(500, 500);
const viewGap = 32;

@Service()
export class ViewService {
  private views: View[] = [];

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
    if (!view) return;
    return { ...view } as const;
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
}

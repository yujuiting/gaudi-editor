import { Service } from 'typedi';
import { Rect, Size, Vector } from 'base/math';

export interface View {
  rootName: string;
  // canvas coordinate
  rect: Rect;
}

const defaultViewSize = Size.of(500, 500);
const viewGap = 32;

@Service()
export class ViewService {
  private views: View[] = [];

  create(rootName: string) {
    const rect = Rect.of(this.getNextViewLocation(), defaultViewSize);
    const view: View = { rootName, rect };
    this.views.push(view);
  }

  destroy(rootName: string) {
    const index = this.views.findIndex(view => view.rootName === rootName);
    if (index > 0) this.views.splice(index, 1);
  }

  get(rootName: string) {
    const view = this.views.find(view => view.rootName === rootName);
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
  localToGlobal(rootName: string, p: Vector) {
    const view = this.get(rootName);
    if (!view) return p;
    return p.add(view.rect.position);
  }

  globalToLocal(rootName: string, p: Vector) {
    const view = this.get(rootName);
    if (!view) return p;
    return p.sub(view.rect.position);
  }
}

import { Rect, Vector } from 'base/math';
import * as array from 'base/array';

enum Dir {
  NW,
  NE,
  SW,
  SE,
}

const dirs = [Dir.NW, Dir.NE, Dir.SW, Dir.SE];

export type RectGetter<T> = (value: T) => Rect;

export class QuadTree<T> {
  get hasChildren() {
    return this.children.length !== 0;
  }

  private values: T[] = [];

  private children: QuadTree<T>[] = array.empty;

  private parent: QuadTree<T> | null = null;

  constructor(private rect: Rect, private getRect: RectGetter<T>, public readonly maximum = 5) {}

  insert(value: T) {
    if (this.hasChildren) {
      return this.insertsToChildren(value);
    }

    this.values.push(value);

    if (this.values.length === this.maximum) {
      return this.split();
    }
  }

  delete(value: T) {
    if (this.hasChildren) {
      return this.deleteFromChildren(value);
    }

    const index = this.values.indexOf(value);

    if (index < 0) {
      return;
    }

    this.values.splice(index, 1);

    if (this.parent) {
      this.parent.checkChildren();
    }
  }

  findNodes(value: T) {
    const result = new Set<QuadTree<T>>();
    const rect = this.getRect(value);
    const queue: QuadTree<T>[] = [this];
    let current = queue.shift();

    while (current) {
      if (current.hasChildren) {
        for (const child of current.children) {
          if (child.rect.overlaps(rect)) {
            queue.push(child);
          }
        }
      } else if (current.rect.overlaps(rect)) {
        if (current.values.includes(value)) {
          result.add(current);
        }
      }
      current = queue.shift();
    }

    return result;
  }

  findIn(rect: Rect) {
    const result = new Set<T>();

    if (!this.rect.overlaps(rect)) {
      return result;
    }

    const queue: QuadTree<T>[] = [this];
    let current = queue.shift();

    while (current) {
      if (current.hasChildren) {
        for (const child of current.children) {
          queue.push(child);
        }
      } else if (rect.overlaps(current.rect)) {
        for (const value of current.values) {
          if (rect.overlaps(current.getRect(value))) {
            result.add(value);
          }
        }
      }
      current = queue.shift();
    }

    return result;
  }

  findOn(point: Vector) {
    const result = new Set<T>();

    if (!this.rect.contains(point)) {
      return result;
    }

    const queue: QuadTree<T>[] = [this];
    let current = queue.shift();

    while (current) {
      if (current.hasChildren) {
        for (const child of current.children) {
          queue.push(child);
        }
      } else if (current.rect.contains(point)) {
        for (const value of current.values) {
          if (current.getRect(value).contains(point)) {
            result.add(value);
          }
        }
      }
      current = queue.shift();
    }

    return result;
  }

  private split() {
    this.children = new Array<QuadTree<T>>(4);

    const size = this.rect.size.mul(0.5);

    for (const dir of dirs) {
      let position: Vector;
      switch (dir) {
        case Dir.NW:
          position = this.rect.position;
          break;
        case Dir.NE:
          position = this.rect.position.add(size.width, 0);
          break;
        case Dir.SW:
          position = this.rect.position.add(0, size.height);
          break;
        case Dir.SE:
          position = this.rect.position.add(size.width, size.height);
          break;
      }

      this.children[dir] = new QuadTree(Rect.of(position, size), this.getRect);
      this.children[dir].parent = this;
    }

    for (const value of this.values) {
      this.insertsToChildren(value);
    }

    this.values = array.empty;
  }

  private merge() {
    this.values = this.children.reduce(
      (values, child) => values.concat(...child.values),
      [] as T[]
    );

    this.children = array.empty;
  }

  private insertsToChildren(value: T) {
    const rect = this.getRect(value);
    if (rect.eq(Rect.zero)) return;
    for (const child of this.children) {
      if (!child.rect.overlaps(rect)) continue;
      child.insert(value);
    }
  }

  private deleteFromChildren(value: T) {
    const rect = this.getRect(value);
    for (const child of this.children) {
      if (!child.rect.overlaps(rect)) continue;
      child.delete(value);
    }
  }

  private checkChildren() {
    const count = this.children.reduce((count, child) => count + child.values.length, 0);

    if (count < this.maximum) {
      return;
    }

    this.merge();
  }
}

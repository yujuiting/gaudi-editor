import { JSONValue } from 'gaudi';

export interface ReadonlyNode<T> {
  readonly parent: ReadonlyNode<T> | null;
  readonly children: ReadonlyArray<ReadonlyNode<T>>;
  readonly value: T;
  forEach(callback: (node: ReadonlyNode<T>) => void): void;
  find(callback: (node: ReadonlyNode<T>) => boolean): ReadonlyNode<T> | null;
  toJSON(): JSONValue;
}

export class Node<T> {
  static of<T>(value: T, parent: Node<T> | null = null, children: Node<T>[] = []) {
    return new Node(value, parent, children);
  }

  get parent() {
    return this._parent;
  }

  get children(): ReadonlyArray<Node<T>> {
    return this._children;
  }

  constructor(
    public value: T,
    private _parent: Node<T> | null = null,
    private _children: Node<T>[] = []
  ) {}

  /**
   *
   * @param value
   * @param at default push to last
   */
  insertChild(child: Node<T>, at = this._children.length) {
    child._parent = this;
    this._children.splice(at, 0, child);
  }

  removeChild(child: Node<T>) {
    const index = this._children.indexOf(child);
    if (index < 0) return;
    child._parent = null;
    this._children.splice(index, 1);
  }

  removeSelfFromParent() {
    if (!this._parent) return;
    this._parent.removeChild(this);
  }

  forEach(callback: (node: Node<T>) => void) {
    const queue: Node<T>[] = [this];
    let current = queue.shift();
    while (current) {
      callback(current);
      for (const child of current._children) queue.push(child);
      current = queue.shift();
    }
  }

  find(callback: (node: Node<T>) => boolean) {
    const queue: Node<T>[] = [this];
    let current = queue.shift();
    while (current) {
      if (callback(current)) return current;
      for (const child of current._children) queue.push(child);
      current = queue.shift();
    }
    return null;
  }

  toReadonly(): ReadonlyNode<T> {
    return this;
  }

  toJSON(): JSONValue {
    return {
      value: `${this.value}`,
      children: this._children.map(node => node.toJSON()),
    };
  }
}

export const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export const fixPrecision = (val: number, precision = 0) => {
  const m = Math.pow(10, precision);
  return Math.floor(val * m) / m;
};

export class Vector {
  static of(x: number, y: number) {
    return new Vector(x, y);
  }

  static eq(a: Vector, b: Vector) {
    return a.eq(b);
  }

  static readonly zero = new Vector(0, 0);

  static readonly minimun = new Vector(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

  static readonly maximin = new Vector(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

  static readonly id = new Vector(1, 1);

  constructor(public readonly x: number, public readonly y: number) {}

  add(x: number, y: number): Vector;
  add(v: Vector): Vector;
  add(x: Vector | number, y = 0) {
    if (typeof x === 'number') return Vector.of(this.x + x, this.y + y);
    return Vector.of(this.x + x.x, this.y + x.y);
  }

  sub(x: number, y: number): Vector;
  sub(v: Vector): Vector;
  sub(x: Vector | number, y = 0) {
    if (typeof x === 'number') return Vector.of(this.x - x, this.y - y);
    return Vector.of(this.x - x.x, this.y - x.y);
  }

  mul(s: number) {
    return Vector.of(this.x * s, this.y * s);
  }

  eq(x: number, y: number): boolean;
  eq(v: Vector): boolean;
  eq(xOrVector: Vector | number, y = 0): boolean {
    if (typeof xOrVector === 'number') return this.x === xOrVector && this.y === y;
    return this.x === xOrVector.x && this.y === xOrVector.y;
  }

  setX(x: number) {
    return Vector.of(x, this.y);
  }

  setY(y: number) {
    return Vector.of(this.x, y);
  }

  len() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  reverse() {
    return Vector.of(-this.x, -this.y);
  }

  fixPrecision(precision = 0) {
    return Vector.of(fixPrecision(this.x, precision), fixPrecision(this.y, precision));
  }

  toString() {
    return `Vector(${this.x}, ${this.y})`;
  }
}

export class Size {
  static of(width: number, height: number) {
    return new Size(width, height);
  }

  static eq(a: Size, b: Size) {
    return a.eq(b);
  }

  static readonly zero = new Size(0, 0);

  constructor(public readonly width: number, public readonly height: number) {}

  add(width: number, height: number): Size;
  add(size: Size): Size;
  add(...args: unknown[]) {
    if (args[0] instanceof Size) {
      return Size.of(this.width + args[0].width, this.height + args[0].height);
    } else if (typeof args[0] === 'number' && typeof args[1] === 'number') {
      return Size.of(this.width + args[0], this.height + args[1]);
    }

    throw new TypeError(`unexpect arguments for Size.add: ${args}`);
  }

  sub(width: number, height: number): Size;
  sub(size: Size): Size;
  sub(...args: unknown[]) {
    if (args[0] instanceof Size) {
      return Size.of(this.width - args[0].width, this.height - args[0].height);
    } else if (typeof args[0] === 'number' && typeof args[1] === 'number') {
      return Size.of(this.width - args[0], this.height - args[1]);
    }

    throw new TypeError(`unexpect arguments for Size.add: ${args}`);
  }

  mul(s: number) {
    return Size.of(this.width * s, this.height * s);
  }

  eq(width: number, height: number): boolean;
  eq(size: Size): boolean;
  eq(widthOrSize: number | Size, height = 0) {
    if (typeof widthOrSize === 'number')
      return this.width === widthOrSize && this.height === height;
    return this.width === widthOrSize.width && this.height === widthOrSize.height;
  }

  setWidth(width: number) {
    return Size.of(width, this.height);
  }

  setHeight(height: number) {
    return Size.of(this.width, height);
  }

  toString() {
    return `Size(${this.width}, ${this.height})`;
  }
}

export class Rect {
  static of(x: number, y: number, width: number, height: number): Rect;
  static of(position: Vector, size: Size): Rect;
  static of(topLeft: Vector, bottomRight: Vector): Rect;
  static of(...args: unknown[]) {
    if (args[0] instanceof Vector && args[1] instanceof Size) {
      return new Rect(args[0], args[1]);
    }

    if (args[0] instanceof Vector && args[1] instanceof Vector) {
      const [topLeft, bottomRight] = args;
      return new Rect(topLeft, Size.of(bottomRight.x - topLeft.x, bottomRight.y - topLeft.y));
    }

    if (args.every(arg => typeof arg === 'number')) {
      const [x, y, width, height] = args as number[];
      return new Rect(Vector.of(x, y), Size.of(width, height));
    }

    throw new TypeError(`unexpect arguments: ${args}`);
  }

  static eq(a: Rect, b: Rect) {
    return a.eq(b);
  }

  static zero = Rect.of(Vector.zero, Size.zero);

  constructor(public readonly position: Vector, public readonly size: Size) {}

  contains({ x, y }: Vector) {
    if (x < this.position.x) return false;

    if (y < this.position.y) return false;

    if (x > this.position.x + this.size.width) return false;

    if (y > this.position.y + this.size.height) return false;

    return true;
  }

  overlaps(that: Rect) {
    if (this.position.x + this.size.width < that.position.x) return false;

    if (that.position.x + that.size.width < this.position.x) return false;

    if (this.position.y + this.size.height < that.position.y) return false;

    if (that.position.y + that.size.height < this.position.y) return false;

    return true;
  }

  eq(rect: Rect) {
    return this.position.eq(rect.position) && this.size.eq(rect.size);
  }

  toString() {
    return `Rect(${this.position}, ${this.size})`;
  }
}

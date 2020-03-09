let nextId = 0;

export function generateId() {
  return `${nextId++}`;
}

export class ScaffoldId {
  private static pool = new Map<string, ScaffoldId>();

  private static regex = /Scaffold\((\d+)\)/;

  static readonly noop = new ScaffoldId('');

  static new() {
    return new ScaffoldId();
  }

  static create(value: string) {
    const matched = ScaffoldId.regex.exec(value);
    if (!matched) throw new Error('invalid value');
    let id = ScaffoldId.pool.get(matched[1]);
    if (!id) id = new ScaffoldId(matched[1]);
    return id;
  }

  static is(value: unknown): value is ScaffoldId {
    return value instanceof ScaffoldId;
  }

  constructor(private value = generateId()) {
    if (ScaffoldId.pool.has(value)) throw new Error('scaffold id collision');
    ScaffoldId.pool.set(this.value, this);
  }

  eq(another: ScaffoldId) {
    return this.toString() === another.toString();
  }

  toString() {
    return `Scaffold(${this.value})`;
  }
}

export class ElementId {
  private static pool = new Map<string, ElementId>();

  static readonly noop = ElementId.create('', ScaffoldId.noop);

  static create(scopeName: string, scaffoldId: ScaffoldId) {
    let id = ElementId.pool.get(`Element(${scopeName}-${scaffoldId})`);
    if (!id) id = new ElementId(scopeName, scaffoldId);
    return id;
  }

  static is(value: unknown): value is ElementId {
    return value instanceof ElementId;
  }

  constructor(public readonly scopeName: string, public readonly scaffoldId: ScaffoldId) {
    if (ElementId.pool.has(this.toString())) throw new Error('element id collision');
    ElementId.pool.set(this.toString(), this);
  }

  eq(another: ElementId) {
    return this.toString() === another.toString();
  }

  toString() {
    return `Element(${this.scopeName}-${this.scaffoldId})`;
  }
}

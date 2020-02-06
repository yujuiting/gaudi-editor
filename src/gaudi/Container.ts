export type Factory<T> = () => Promise<T> | T;

export class Container<V = unknown, F extends Factory<V> = Factory<V>> {
  private pool = new Map<string, V>();

  private factories = new Map<string, F>();

  public provide(id: string, value: V) {
    if (this.has(id)) {
      throw new Error(`id: ${id} collision`);
    }

    this.pool.set(id, value);
  }

  public provideFactory(id: string, factory: F) {
    if (this.has(id)) {
      throw new Error(`id: ${id} collision`);
    }

    this.factories.set(id, factory);
  }

  public has(id: string) {
    return this.pool.has(id) || this.factories.has(id);
  }

  public get(id: string) {
    return this.pool.get(id);
  }

  public getIds() {
    return Array.from(this.pool.keys());
  }

  public async loadAll() {
    const ids = Array.from(this.factories.keys());
    await Promise.all(ids.map(id => this.load(id)));
  }

  public async load(id: string) {
    if (this.pool.has(id)) {
      return;
    }

    const factory = this.factories.get(id);

    if (!factory) {
      return;
    }

    const value = await factory();

    this.pool.set(id, value);
  }
}

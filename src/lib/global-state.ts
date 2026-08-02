type Listener = () => void;

export class GlobalState<T extends Record<string, any>> {
  private store: Partial<T> = {};
  private listeners = new Set<Listener>();

  set<K extends keyof T>(key: K, value: T[K]): void {
    if (this.store[key] === value) return;
    this.store = { ...this.store, [key]: value };
    this.notify();
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.store[key];
  }

  snapshot(): Partial<T> {
    return this.store;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        /* listener errors should not break the store */
      }
    });
  }
}

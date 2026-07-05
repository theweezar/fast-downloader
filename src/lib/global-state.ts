type Listener = () => void;

export class GlobalState {
  private store: Record<string, any> = {};
  private listeners = new Set<Listener>();

  set(key: string, value: any): void {
    this.store = {
      ...this.store,
      [key]: value
    }
    this.notify();
  }

  get(key: string): any {
    return this.store[key];
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

  snapshot() {
    return this.store;
  }
}

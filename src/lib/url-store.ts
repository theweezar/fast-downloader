type Listener = () => void;

export const CATEGORY = {
  IMAGES: "images",
  POSTS: "posts",
  VIDEOS: "videos",
} as const;

export type CategoryName = (typeof CATEGORY)[keyof typeof CATEGORY];

export class Category {
  private store: UrlStore;
  private name: string;

  constructor(store: UrlStore, name: string) {
    this.store = store;
    this.name = name;
  }

  merge(urls: Record<string, string> | null | undefined): void {
    if (!urls || typeof urls !== "object") return;
    const data = this.store.data;
    if (!data[this.name]) data[this.name] = {};
    let changed = false;
    for (const [key, value] of Object.entries(urls)) {
      if (data[this.name][key] !== value) changed = true;
      data[this.name][key] = value;
    }
    if (changed) this.store.notify();
  }

  all(): Record<string, string> {
    return { ...(this.store.data[this.name] || {}) };
  }

  count(): number {
    return Object.keys(this.store.data[this.name] || {}).length;
  }

  values(): string[] {
    return Object.values(this.store.data[this.name] || {});
  }

  reset(): void {
    if (this.store.data[this.name]) {
      this.store.data[this.name] = {};
      this.store.notify();
    }
  }

  download(filename: string): void {
    const store = this.store.data[this.name] || {};
    const entries = Object.entries(store).map(([fileName, url]) => ({
      fileName,
      url,
    }));
    const blob = new Blob([JSON.stringify({ entries }, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }
}

export class UrlStore {
  /** @internal accessed by Category */
  data: Record<string, Record<string, string>> = {};
  private listeners = new Set<Listener>();
  private categoryCache = new Map<string, Category>();

  getCategory(name: string): Category {
    let cat = this.categoryCache.get(name);
    if (!cat) {
      cat = new Category(this, name);
      this.categoryCache.set(name, cat);
    }
    return cat;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** @internal accessed by Category */
  notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        /* listener errors should not break the store */
      }
    });
  }
}

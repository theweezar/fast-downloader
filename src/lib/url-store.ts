type Listener = () => void;

export class UrlStore {
  private store: Record<string, string> = {};
  private listeners = new Set<Listener>();

  merge(urls: Record<string, string> | null | undefined): void {
    if (!urls || typeof urls !== "object") return;
    let changed = false;
    for (const [key, value] of Object.entries(urls)) {
      if (this.store[key] !== value) changed = true;
      this.store[key] = value;
    }
    if (changed) this.notify();
  }

  getAll(): Record<string, string> {
    return { ...this.store };
  }

  getCount(): number {
    return Object.keys(this.store).length;
  }

  values(): string[] {
    return Object.values(this.store);
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

  downloadJson(filename: string): void {
    const entries = Object.entries(this.store).map(([fileName, url]) => ({
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

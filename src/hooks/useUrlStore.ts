import { useSyncExternalStore, useCallback } from "react";
import type { Category } from "../lib/url-store";
import type { UrlStore } from "../lib/url-store";

export function useUrlStore(store: UrlStore, category: Category) {
  const count = useSyncExternalStore(
    useCallback((cb: () => void) => store.subscribe(cb), [store]),
    () => category.count()
  );

  return { category, count };
}

import { useSyncExternalStore, useCallback } from "react";
import { UrlStore } from "../lib/url-store";

export function useUrlStore(store: UrlStore) {
  const count = useSyncExternalStore(
    useCallback((cb: () => void) => store.subscribe(cb), [store]),
    () => store.getCount()
  );

  return {
    count,
    downloadJson: (filename: string) => store.downloadJson(filename),
  };
}

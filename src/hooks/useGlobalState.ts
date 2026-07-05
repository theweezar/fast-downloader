import { useSyncExternalStore, useCallback } from "react";
import type { GlobalState } from "../lib/global-state";

export function useGlobalState(globalState: GlobalState) {
  const snapshot = useSyncExternalStore(
    useCallback((cb: () => void) => globalState.subscribe(cb), [globalState]),
    () => globalState.snapshot()
  );

  return {
    snapshot,
    set: (key: string, value: any) => globalState.set(key, value),
    get: (key: string) => globalState.get(key)
  };
}

import { useSyncExternalStore, useCallback } from "react";
import type { GlobalState } from "../lib/global-state";

export function useGlobalState<T extends Record<string, any>>(
  globalState: GlobalState<T>
) {
  const snapshot = useSyncExternalStore(
    useCallback((cb: () => void) => globalState.subscribe(cb), [globalState]),
    () => globalState.snapshot()
  );

  return { snapshot, globalState };
}

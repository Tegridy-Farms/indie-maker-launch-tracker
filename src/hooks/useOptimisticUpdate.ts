import { useState, useCallback, useRef } from "react";

/**
 * useOptimisticUpdate — reusable optimistic-state + revert helper.
 *
 * Immediately applies the new value, runs the async action, and reverts
 * to the previous value if the action throws.
 *
 * @returns [value, applyOptimistic] where applyOptimistic(newValue, asyncFn)
 *   sets the value optimistically, awaits asyncFn(), and reverts on error.
 */
export function useOptimisticUpdate<T>(
  initialValue: T
): [T, (newValue: T, action: () => Promise<void>) => Promise<void>, (v: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  // Use a ref to always capture the latest value without stale-closure issues
  const valueRef = useRef<T>(initialValue);

  const set = useCallback((v: T) => {
    valueRef.current = v;
    setValue(v);
  }, []);

  const applyOptimistic = useCallback(
    async (newValue: T, action: () => Promise<void>) => {
      const previous = valueRef.current;
      set(newValue);
      try {
        await action();
      } catch {
        set(previous);
        throw new Error("optimistic_revert");
      }
    },
    [set]
  );

  return [value, applyOptimistic, set];
}

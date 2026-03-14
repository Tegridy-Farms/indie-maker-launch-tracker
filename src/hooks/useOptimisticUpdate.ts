import { useState, useCallback } from "react";

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
): [T, (newValue: T, action: () => Promise<void>) => Promise<void>] {
  const [value, setValue] = useState<T>(initialValue);

  const applyOptimistic = useCallback(
    async (newValue: T, action: () => Promise<void>) => {
      const previous = value;
      setValue(newValue);
      try {
        await action();
      } catch {
        setValue(previous);
        throw new Error("optimistic_revert");
      }
    },
    [value]
  );

  return [value, applyOptimistic];
}

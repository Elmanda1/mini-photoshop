import { useEffect, useRef } from "react";

/**
 * Calls `callback` after `delay` ms of inactivity.
 * Resets the timer whenever `deps` change.
 */
export function useDebouncedEffect(
  callback: () => void,
  deps: any[],
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref fresh
  callbackRef.current = callback;

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

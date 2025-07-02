import { useCallback, useRef, useState, useEffect } from "react";

// Debounced function
export function useDebounce(callback, delay) {
  const timeoutIdRef = useRef(null);

  return useCallback(
    (...args) => {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

// Debounced value
export function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

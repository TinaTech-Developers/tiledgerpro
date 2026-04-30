import { useEffect } from "react";

export function useDebounce(value: string, delay = 400, callback: () => void) {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay, callback]);
}

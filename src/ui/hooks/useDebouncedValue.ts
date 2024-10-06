import { useEffect, useState } from "react";

export function useDebouncedValue<T>(
  initialValue: T,
  delay: number,
  changeHandler: (value: T) => void
) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      changeHandler(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [value, setValue] as const;
}

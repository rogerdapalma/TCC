import React from "react";

/** Debounce controlado por estado (para inputs). */
export default function useDebouncedValue(value, delay = 150) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
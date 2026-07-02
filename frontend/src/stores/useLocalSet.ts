import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";

export function useLocalSet(key: string) {
  const [values, setValues] = useState<string[]>([]);
  const valueSet = useMemo(() => new Set(values), [values]);

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw) {
          setValues(JSON.parse(raw));
        }
      })
      .catch(() => setValues([]));
  }, [key]);

  const persist = async (next: string[]) => {
    setValues(next);
    await AsyncStorage.setItem(key, JSON.stringify(next));
  };

  return {
    values,
    has: (id: string) => valueSet.has(id),
    toggle: async (id: string) => {
      const next = valueSet.has(id) ? values.filter((item) => item !== id) : [...values, id];
      await persist(next);
    },
    clear: async () => persist([])
  };
}

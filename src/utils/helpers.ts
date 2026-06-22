// Funções auxiliares gerais

export const calculateTotalOdd = (odds: number[]): number => {
  return odds.reduce((acc, odd) => acc * odd, 1);
};

export const calculatePotentialReturn = (stake: number, odd: number): number => {
  return stake * odd;
};

export const groupBy = <T, K extends PropertyKey>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isDevelopment = (): boolean => {
  return __DEV__ !== false;
};

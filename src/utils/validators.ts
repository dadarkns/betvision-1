// Funções de validação

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // Mínimo 8 caracteres, pelo menos 1 letra e 1 número
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
};

export const isValidOdd = (odd: number): boolean => {
  return odd > 0 && odd < 1000;
};

export const isValidStake = (stake: number): boolean => {
  return stake > 0 && stake <= 1000000;
};

export const isProbabilityValid = (probability: number): boolean => {
  return probability >= 0 && probability <= 1;
};

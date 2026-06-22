// Tipos relacionados a usuários

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  notifications: boolean;
  favoriteLeagues: string[];
  minProbability: number; // Filtro padrão no radar
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

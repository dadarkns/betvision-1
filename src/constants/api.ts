// Constantes de API e endpoints

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  MATCHES: {
    LIST: '/matches',
    DETAIL: '/matches/:id',
    ANALYSIS: '/matches/:id/analysis',
  },
  ANALYSIS: {
    GENERATE: '/analysis/generate',
    HISTORY: '/analysis/history',
  },
};

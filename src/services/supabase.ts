import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { backendConfig } from '@/config/backend';

const supabaseUrl = backendConfig.supabase.url;
const supabaseAnonKey = backendConfig.supabase.anonKey;

// Log de aviso no console para auxiliar o desenvolvedor no setup inicial
if (!backendConfig.supabase.enabled) {
  console.warn(
    '[BetVision] Supabase não está configurado no arquivo .env. ' +
    'Certifique-se de configurar EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

/**
 * Cliente Supabase configurado para Expo React Native.
 * Utiliza o AsyncStorage para manter a sessão do usuário persistente de forma segura.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

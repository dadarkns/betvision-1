import { supabase } from '@/services/supabase';
import { backendConfig } from '@/config/backend';

// Se o Supabase estiver desabilitado, criamos mocks para não quebrar a UI antes da configuração inicial
const isMock = !backendConfig.supabase.enabled;

if (isMock) {
  console.warn(
    '[BetVision] Utilizando MOCK para authService porque o Supabase não está configurado. ' +
    'Para utilizar o fluxo real, configure as credenciais no .env.'
  );
}

export const authService = {
  /**
   * Realiza login do usuário com e-mail e senha.
   */
  async signInWithEmail(email: string, password: string) {
    if (isMock) {
      // Mock de login de sucesso em desenvolvimento
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email,
            created_at: new Date().toISOString(),
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
          },
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Realiza o cadastro de um novo usuário com e-mail e senha.
   */
  async signUpWithEmail(email: string, password: string) {
    if (isMock) {
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email,
            created_at: new Date().toISOString(),
          },
          session: null,
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Finaliza a sessão do usuário conectado.
   */
  async signOut() {
    if (isMock) {
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Obtém a sessão atual do usuário de forma assíncrona.
   */
  async getSession() {
    if (isMock) {
      return {
        data: {
          session: {
            user: {
              id: 'mock-user-id',
              email: 'mock@betvision.com',
            },
          },
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  /**
   * Escuta mudanças no estado de autenticação (login, logout, refresh de token).
   * Retorna uma função para remover o listener.
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (isMock) {
      // Retorna uma função vazia para fins de mock
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return data;
  }
};

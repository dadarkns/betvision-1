import { backendConfig, getSportsApiHeaders } from '@/config/backend';

const BASE_URL = backendConfig.sportsApi.baseUrl;
const TIMEOUT_MS = backendConfig.sportsApi.requestTimeoutMs;

export interface ApiSportsResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: Record<string, string> | string[] | any;
  results: number;
  paging?: {
    current: number;
    total: number;
  };
  response: T[];
}

/**
 * Função utilitária base para fazer requisições à API-Sports.
 * Lida com headers, timeout configurado e tratamento de erros.
 */
export async function fetchSportsApi<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<ApiSportsResponse<T>> {
  if (!backendConfig.sportsApi.enabled) {
    throw new Error(
      '[BetVision] API-Sports não configurada. Defina EXPO_PUBLIC_APISPORTS_KEY no arquivo .env.'
    );
  }

  // Constroi a URL final com parâmetros de busca
  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;

  // Configura AbortController para lidar com timeout da requisição
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers = getSportsApiHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data: ApiSportsResponse<T> = await response.json();

    // Trata erros de cota ou parâmetros inválidos retornados no corpo da API-Sports
    if (data.errors && Object.keys(data.errors).length > 0) {
      const errorMsg = typeof data.errors === 'object' ? JSON.stringify(data.errors) : String(data.errors);
      if (errorMsg !== '[]' && errorMsg !== '{}') {
        throw new Error(`Erro retornado pela API-Sports: ${errorMsg}`);
      }
    }

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`A requisição excedeu o tempo limite configurado de ${TIMEOUT_MS}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Métodos da API-Sports mapeados com base nas regras do frontend-backend-config.json
 */
export const sportsApiService = {
  /**
   * Obtém calendário e partidas (fixtures) filtradas por data ou liga.
   */
  async getFixtures(params: { date?: string; league?: string; season?: string; live?: string; [key: string]: any }) {
    // Limita o retorno de partidas para controle de quota se configurado
    const limit = backendConfig.sportsApi.fixtureLimit;
    const requestParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        requestParams[key] = String(val);
      }
    });

    const result = await fetchSportsApi<any>('/fixtures', requestParams);
    
    // Se houver limite configurado e o resultado exceder, limitamos os resultados
    if (limit && result.response.length > limit) {
      return {
        ...result,
        response: result.response.slice(0, limit)
      };
    }
    
    return result;
  },

  /**
   * Obtém as probabilidades 1X2, previsões, conselho e H2H da partida.
   */
  async getPredictions(fixtureId: number | string) {
    return fetchSportsApi<any>('/predictions', { fixture: String(fixtureId) });
  },

  /**
   * Obtém as odds pré-match para mercados de aposta de uma determinada partida.
   */
  async getOdds(fixtureId: number | string) {
    return fetchSportsApi<any>('/odds', { fixture: String(fixtureId) });
  },

  /**
   * Obtém estatísticas detalhadas (posse de bola, finalizações, etc.) de uma partida live ou finalizada.
   */
  async getFixtureStatistics(fixtureId: number | string) {
    return fetchSportsApi<any>('/fixtures/statistics', { fixture: String(fixtureId) });
  },

  /**
   * Obtém eventos ocorridos na partida (gols, cartões, substituições).
   */
  async getFixtureEvents(fixtureId: number | string) {
    return fetchSportsApi<any>('/fixtures/events', { fixture: String(fixtureId) });
  },

  /**
   * Obtém as escalações oficiais/confirmadas de ambos os times para a partida.
   */
  async getFixtureLineups(fixtureId: number | string) {
    return fetchSportsApi<any>('/fixtures/lineups', { fixture: String(fixtureId) });
  }
};

/**
 * BetVision – Configuração de Backend
 * Fonte de verdade para variáveis de ambiente e habilitação de serviços.
 * Consulte frontend-backend-config.json para a especificação completa.
 */

// ─── Variáveis de ambiente ───────────────────────────────────────────────────

const APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as
  | 'development'
  | 'staging'
  | 'production';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const APISPORTS_BASE_URL =
  process.env.EXPO_PUBLIC_APISPORTS_BASE_URL ?? 'https://v3.football.api-sports.io';
const APISPORTS_KEY = process.env.EXPO_PUBLIC_APISPORTS_KEY ?? '';

const FIXTURE_LIMIT = Number(process.env.EXPO_PUBLIC_SPORTS_FIXTURE_LIMIT ?? '4');
const REQUEST_TIMEOUT_MS = Number(
  process.env.EXPO_PUBLIC_SPORTS_REQUEST_TIMEOUT_MS ?? '12000',
);
const STATS_CACHE_VERSION = process.env.EXPO_PUBLIC_REAL_STATS_CACHE_VERSION ?? 'v1';

// ─── Verificação de habilitação de serviços ──────────────────────────────────

/** Supabase está habilitado quando URL e chave anon estão configuradas. */
export const isSupabaseEnabled =
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 12;

/** API Sports está habilitada quando a chave tiver mais de 8 caracteres. */
export const isSportsApiEnabled = APISPORTS_KEY.length > 8;

// ─── Configurações exportadas ────────────────────────────────────────────────

export const backendConfig = {
  appEnv: APP_ENV,

  supabase: {
    enabled: isSupabaseEnabled,
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  },

  sportsApi: {
    enabled: isSportsApiEnabled,
    baseUrl: APISPORTS_BASE_URL,
    apiKey: APISPORTS_KEY,
    fixtureLimit: FIXTURE_LIMIT,
    requestTimeoutMs: REQUEST_TIMEOUT_MS,
    statsCacheVersion: STATS_CACHE_VERSION,
  },
} as const;

// ─── Endpoints da API Sports ─────────────────────────────────────────────────

export const SPORTS_ENDPOINTS = {
  /** Calendário e fixtures por data */
  FIXTURES: '/fixtures',
  /** Probabilidades 1X2, comparações, conselho e H2H */
  PREDICTIONS: '/predictions',
  /** Odds pré-match */
  ODDS: '/odds',
  /** Estatísticas de partida live/finalizada */
  FIXTURE_STATISTICS: '/fixtures/statistics',
  /** Eventos da partida */
  FIXTURE_EVENTS: '/fixtures/events',
  /** Escalações */
  FIXTURE_LINEUPS: '/fixtures/lineups',
} as const;

// ─── Helper para cabeçalhos da API Sports ────────────────────────────────────

/**
 * Retorna os headers necessários para requisições à API Sports.
 * Lança erro se a chave não estiver configurada.
 */
export function getSportsApiHeaders(): Record<string, string> {
  if (!isSportsApiEnabled) {
    throw new Error(
      '[BetVision] EXPO_PUBLIC_APISPORTS_KEY não configurada. ' +
        'Adicione a chave no arquivo .env.',
    );
  }
  return {
    'x-apisports-key': APISPORTS_KEY,
    'Content-Type': 'application/json',
  };
}

export type AppEnv = typeof APP_ENV;
export type BackendConfig = typeof backendConfig;

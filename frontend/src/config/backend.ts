type BackendEnvironment = "development" | "staging" | "production";

function envValue(key: string) {
  return process.env[key]?.trim() ?? "";
}

function numberEnv(key: string, fallback: number) {
  const value = Number(envValue(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function appEnvironment(): BackendEnvironment {
  const value = envValue("EXPO_PUBLIC_APP_ENV");
  if (value === "staging" || value === "production") {
    return value;
  }
  return "development";
}

const supabaseUrl = envValue("EXPO_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = envValue("EXPO_PUBLIC_SUPABASE_ANON_KEY");
const sportsApiBaseUrl = envValue("EXPO_PUBLIC_APISPORTS_BASE_URL") || "https://v3.football.api-sports.io";
const sportsApiKey = envValue("EXPO_PUBLIC_APISPORTS_KEY");
const betvisionAiBaseUrl = envValue("EXPO_PUBLIC_BETVISION_AI_BASE_URL");

export const backendConfig = {
  environment: appEnvironment(),
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    configured: supabaseUrl.startsWith("http") && supabaseAnonKey.length > 12
  },
  sportsApi: {
    baseUrl: sportsApiBaseUrl,
    apiKey: sportsApiKey,
    configured: sportsApiKey.length > 8,
    requestTimeoutMs: numberEnv("EXPO_PUBLIC_SPORTS_REQUEST_TIMEOUT_MS", 12000),
    defaultFixtureLimit: numberEnv("EXPO_PUBLIC_SPORTS_FIXTURE_LIMIT", 4),
    cacheVersion: envValue("EXPO_PUBLIC_REAL_STATS_CACHE_VERSION") || "v1"
  },
  betvisionAi: {
    baseUrl: betvisionAiBaseUrl.replace(/\/+$/, ""),
    configured: betvisionAiBaseUrl.startsWith("http"),
    requestTimeoutMs: numberEnv("EXPO_PUBLIC_BETVISION_AI_TIMEOUT_MS", 8000)
  }
} as const;

export function getBackendConfigStatus() {
  return {
    environment: backendConfig.environment,
    supabaseConfigured: backendConfig.supabase.configured,
    sportsApiConfigured: backendConfig.sportsApi.configured,
    betvisionAiConfigured: backendConfig.betvisionAi.configured
  };
}

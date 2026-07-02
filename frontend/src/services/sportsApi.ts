import { backendConfig } from "@/config/backend";

const baseUrl = backendConfig.sportsApi.baseUrl;
const apiKey = backendConfig.sportsApi.apiKey;

export type ApiSportsResponse<T> = {
  get?: string;
  parameters?: Record<string, string>;
  errors?: unknown;
  results?: number;
  paging?: { current: number; total: number };
  response: T;
};

export type ApiSportsFixture = {
  fixture: {
    id: number;
    date: string;
    timestamp?: number;
    status?: {
      long?: string;
      short?: string;
      elapsed?: number | null;
    };
    venue?: {
      name?: string | null;
      city?: string | null;
    };
  };
  league: {
    id: number;
    name: string;
    country?: string;
    season: number;
    round?: string | null;
    logo?: string;
    flag?: string;
  };
  teams: {
    home: ApiSportsTeamRef;
    away: ApiSportsTeamRef;
  };
  goals?: {
    home: number | null;
    away: number | null;
  };
};

export type ApiSportsTeamRef = {
  id: number;
  name: string;
  code?: string | null;
  country?: string | null;
  logo?: string | null;
  winner?: boolean | null;
};

export type ApiSportsPrediction = {
  predictions?: {
    winner?: { id?: number; name?: string; comment?: string | null };
    win_or_draw?: boolean;
    under_over?: string | null;
    goals?: { home?: string | null; away?: string | null };
    advice?: string;
    percent?: { home?: string; draw?: string; away?: string };
  };
  league?: ApiSportsFixture["league"];
  teams?: {
    home?: ApiSportsPredictionTeam;
    away?: ApiSportsPredictionTeam;
  };
  comparison?: Record<string, { home?: string; away?: string }>;
  h2h?: ApiSportsFixture[];
};

export type ApiSportsPredictionTeam = ApiSportsTeamRef & {
  last_5?: {
    played?: number;
    form?: string;
    att?: string;
    def?: string;
    goals?: {
      for?: { total?: number; average?: string };
      against?: { total?: number; average?: string };
    };
  };
  league?: ApiSportsTeamStatistics;
};

export type ApiSportsTeamStatistics = {
  form?: string;
  fixtures?: {
    played?: { home?: number; away?: number; total?: number };
    wins?: { home?: number; away?: number; total?: number };
    draws?: { home?: number; away?: number; total?: number };
    loses?: { home?: number; away?: number; total?: number };
  };
  goals?: {
    for?: ApiSportsGoalSplit;
    against?: ApiSportsGoalSplit;
  };
  clean_sheet?: { home?: number; away?: number; total?: number };
  failed_to_score?: { home?: number; away?: number; total?: number };
  cards?: unknown;
};

export type ApiSportsGoalSplit = {
  total?: { home?: number; away?: number; total?: number };
  average?: { home?: string; away?: string; total?: string };
  under_over?: Record<string, { over?: number; under?: number }>;
};

export type ApiSportsOddsFixture = {
  fixture?: { id: number };
  update?: string;
  bookmakers?: Array<{
    id?: number;
    name?: string;
    bets?: Array<{
      id?: number;
      name?: string;
      values?: Array<{ value?: string; odd?: string }>;
    }>;
  }>;
};

export type ApiSportsFixtureStatistics = {
  team?: ApiSportsTeamRef;
  statistics?: Array<{ type?: string; value?: string | number | null }>;
};

export type ApiSportsEvent = {
  time?: { elapsed?: number; extra?: number | null };
  team?: ApiSportsTeamRef;
  player?: { id?: number | null; name?: string | null };
  assist?: { id?: number | null; name?: string | null };
  type?: string;
  detail?: string;
  comments?: string | null;
};

export type ApiSportsLineup = {
  team?: ApiSportsTeamRef;
  formation?: string;
  startXI?: Array<{ player?: { id?: number; name?: string; number?: number; pos?: string } }>;
  substitutes?: Array<{ player?: { id?: number; name?: string; number?: number; pos?: string } }>;
};

export type SportsApiStatus = {
  configured: boolean;
  message?: string;
};

export const sportsApiStatus: SportsApiStatus = {
  configured: backendConfig.sportsApi.configured,
  message: backendConfig.sportsApi.configured ? undefined : "Configure EXPO_PUBLIC_APISPORTS_KEY no .env para carregar jogos reais."
};

export async function apiFootballGet<T>(path: string, params: Record<string, string | number | undefined> = {}) {
  if (!sportsApiStatus.configured) {
    throw new Error(sportsApiStatus.message);
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const url = `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}${query ? `?${query}` : ""}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), backendConfig.sportsApi.requestTimeoutMs);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey
    },
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`API esportiva respondeu com status ${response.status}.`);
  }

  const payload = (await response.json()) as ApiSportsResponse<T>;
  const errors = payload.errors;

  if (errors && Object.keys(errors as Record<string, unknown>).length > 0) {
    throw new Error(`API esportiva retornou erro: ${JSON.stringify(errors)}`);
  }

  return payload;
}

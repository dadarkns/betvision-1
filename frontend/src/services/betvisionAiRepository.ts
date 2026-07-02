import { backendConfig } from "@/config/backend";
import { DataSourceKind, MarketCategory, MarketProbability, Match, RealStatValue, Team } from "@/types/domain";

type BetvisionAiPrediction = {
  fixture_id: number | null;
  generated_at: string;
  match: string;
  model_version: string;
  confidence: string;
  coverage: Record<string, unknown>;
  fixture_meta?: {
    league_id?: number;
    league_name?: string;
    league_logo?: string;
    season?: number;
    round?: string;
    starts_at?: string;
    status?: string;
    venue?: string;
    home_id?: number;
    home_logo?: string;
    away_id?: number;
    away_logo?: string;
  };
  expected: {
    home_goals: number;
    away_goals: number;
    home_shots: number;
    away_shots: number;
    home_shots_on_target: number;
    away_shots_on_target: number;
    home_corners: number;
    away_corners: number;
    home_fouls: number;
    away_fouls: number;
    home_cards: number;
    away_cards: number;
  };
  result: { home: number; draw: number; away: number };
  scorelines: Array<{ score: string; probability: number }>;
  goals: Record<string, { over: number; under: number }>;
  both_teams_score: { yes: number; no: number };
  handicaps: Record<string, { win: number; push: number; loss: number }>;
  counts: Record<string, Record<string, { over: number; under: number }>>;
  player_props: Array<Record<string, unknown>>;
  user_analysis?: {
    summary?: string;
    favorite?: { selection: string; side: "home" | "draw" | "away"; probability: number };
    strongest_market?: { market: string; selection: string; probability: number; risk: string };
    risk?: string;
    alerts?: string[];
    disclaimer?: string;
  };
  _source_date?: string;
};

type PredictionsPayload = {
  date: string;
  generated_at?: string;
  predictions: BetvisionAiPrediction[];
  failures?: string[];
};

const source: DataSourceKind = "computed-real";

const translatedTeams: Record<string, string> = {
  "Argentina": "Argentina",
  "Australia": "Austrália",
  "Austria": "Áustria",
  "Belgium": "Bélgica",
  "Cape Verde Islands": "Cabo Verde",
  "Colombia": "Colômbia",
  "Congo DR": "RD Congo",
  "Croatia": "Croácia",
  "Curaçao": "Curaçao",
  "Ecuador": "Equador",
  "Egypt": "Egito",
  "England": "Inglaterra",
  "France": "França",
  "Germany": "Alemanha",
  "Ghana": "Gana",
  "Iran": "Irã",
  "Iraq": "Iraque",
  "Ivory Coast": "Costa do Marfim",
  "Japan": "Japão",
  "Jordan": "Jordânia",
  "Netherlands": "Países Baixos",
  "New Zealand": "Nova Zelândia",
  "Norway": "Noruega",
  "Panama": "Panamá",
  "Paraguay": "Paraguai",
  "Portugal": "Portugal",
  "Saudi Arabia": "Arábia Saudita",
  "Senegal": "Senegal",
  "Spain": "Espanha",
  "Sweden": "Suécia",
  "Tunisia": "Tunísia",
  "Türkiye": "Turquia",
  "Turkey": "Turquia",
  "USA": "Estados Unidos",
  "United States": "Estados Unidos",
  "Uruguay": "Uruguai",
  "Uzbekistan": "Uzbequistão"
};

function translateTeamName(name: string) {
  return translatedTeams[name] ?? name;
}

function translateCompetition(name?: string) {
  return {
    "World Cup": "Copa do Mundo",
    "Serie B": "Brasileirão Série B",
    "Serie A": "Brasileirão Série A"
  }[name ?? ""] ?? name ?? "Competição";
}

function sourceStrength(probability: number): MarketProbability["strength"] {
  if (probability >= 72) {
    return "strong";
  }
  if (probability >= 48) {
    return "balanced";
  }
  return "risky";
}

function roundProbability(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function team(name: string, side: "home" | "away", fixtureId: number, id?: number, logo?: string): Team {
  return {
    id: id ? `api-team-${id}` : `ai-team-${fixtureId}-${side}`,
    name,
    countryCode: side === "home" ? "HOM" : "AWY",
    flag: logo ?? "",
    accentColor: side === "home" ? "#3b82f6" : "#cbd5e1",
    form: []
  };
}

function splitMatchName(match: string) {
  const [home, away] = match.split(" x ");
  return {
    home: translateTeamName(home?.trim() || "Mandante"),
    away: translateTeamName(away?.trim() || "Visitante")
  };
}

function market(
  id: string,
  category: MarketCategory,
  label: string,
  probability: number,
  side?: "home" | "away" | "neutral"
): MarketProbability {
  const rounded = roundProbability(probability);
  return {
    id,
    category,
    label,
    probability: rounded,
    side,
    source,
    strength: sourceStrength(rounded),
    calculationNote: "Probabilidade gerada pela IA da BetVision: modelo estatístico e simulação."
  };
}

function mapResultMarkets(prediction: BetvisionAiPrediction, names: { home: string; away: string }) {
  return [
    market("ai-home-win", "result", `Vitória ${names.home}`, prediction.result.home, "home"),
    market("ai-draw", "result", "Empate", prediction.result.draw, "neutral"),
    market("ai-away-win", "result", `Vitória ${names.away}`, prediction.result.away, "away")
  ];
}

function mapDoubleChanceMarkets(prediction: BetvisionAiPrediction, names: { home: string; away: string }) {
  const homeDraw = prediction.result.home + prediction.result.draw;
  const awayDraw = prediction.result.away + prediction.result.draw;
  const noDraw = prediction.result.home + prediction.result.away;
  return [
    market("ai-double-home-draw", "doubleChance", `${names.home} ou empate`, homeDraw, "home"),
    market("ai-double-away-draw", "doubleChance", `${names.away} ou empate`, awayDraw, "away"),
    market("ai-double-no-draw", "doubleChance", `${names.home} ou ${names.away}`, noDraw, "neutral")
  ];
}

function mapGoalsMarkets(prediction: BetvisionAiPrediction) {
  const rows: MarketProbability[] = [];
  for (const [line, values] of Object.entries(prediction.goals)) {
    rows.push(market(`ai-goals-over-${line}`, "goals", `Over ${line} gols`, values.over, "neutral"));
    rows.push(market(`ai-goals-under-${line}`, "goals", `Under ${line} gols`, values.under, "neutral"));
  }
  rows.push(market("ai-btts-yes", "goals", "Ambas marcam: sim", prediction.both_teams_score.yes, "neutral"));
  rows.push(market("ai-btts-no", "goals", "Ambas marcam: não", prediction.both_teams_score.no, "neutral"));
  return rows;
}

function countCategory(key: string): MarketCategory | undefined {
  if (key === "shots") {
    return "shots";
  }
  if (key === "shots_on_target") {
    return "shotsOnTarget";
  }
  if (key === "corners") {
    return "corners";
  }
  if (key === "fouls") {
    return "fouls";
  }
  if (key === "cards") {
    return "cards";
  }
  return undefined;
}

function countLabel(key: string) {
  return {
    shots: "Chutes",
    shots_on_target: "Chutes no alvo",
    corners: "Escanteios",
    fouls: "Faltas",
    cards: "Cartões"
  }[key] ?? key;
}

function mapCountMarkets(prediction: BetvisionAiPrediction) {
  const rows: MarketProbability[] = [];
  for (const [key, lines] of Object.entries(prediction.counts)) {
    const category = countCategory(key);
    if (!category) {
      continue;
    }
    for (const [line, values] of Object.entries(lines)) {
      rows.push(market(`ai-${key}-over-${line}`, category, `${countLabel(key)} acima de ${line}`, values.over, "neutral"));
      rows.push(market(`ai-${key}-under-${line}`, category, `${countLabel(key)} abaixo de ${line}`, values.under, "neutral"));
    }
  }
  return rows;
}

function mapHandicapMarkets(prediction: BetvisionAiPrediction, homeName: string) {
  return Object.entries(prediction.handicaps).map(([line, values]) =>
    market(`ai-handicap-${line}`, "handicap", `${homeName} handicap ${line}`, values.win, "home")
  );
}

function mapBackendStrongestMarket(prediction: BetvisionAiPrediction) {
  const strongest = prediction.user_analysis?.strongest_market;
  if (!strongest) {
    return [];
  }
  const selection = Object.entries(translatedTeams).reduce(
    (text, [original, translated]) => text.split(original).join(translated),
    strongest.selection
  );
  return [
    market(
      "ai-backend-strongest",
      strongest.market === "Resultado" ? "result" : strongest.market === "Dupla chance" ? "doubleChance" : "goals",
      selection,
      strongest.probability,
      selection.includes("Vitória") ? "neutral" : "neutral"
    )
  ];
}

function scoreProjection(prediction: BetvisionAiPrediction) {
  const [homeRaw = "0", awayRaw = "0"] = (prediction.scorelines[0]?.score ?? "0x0").split("x");
  return {
    home: Number(homeRaw) || 0,
    away: Number(awayRaw) || 0,
    alternatives: prediction.scorelines.map((item) => `${item.score} (${item.probability.toFixed(2)}%)`)
  };
}

function realStats(prediction: BetvisionAiPrediction, updatedAt: string): RealStatValue[] {
  return [
    { label: "Modelo da IA", value: prediction.model_version, source, updatedAt },
    { label: "Confiança", value: prediction.confidence, source, updatedAt },
    { label: "Amostra de treino", value: String(prediction.coverage.training_matches ?? "N/D"), source, updatedAt },
    { label: "Jogos detalhados", value: String(prediction.coverage.detailed_training_matches ?? "N/D"), source, updatedAt },
    { label: "Fonte detalhada", value: String(prediction.coverage.detailed_source ?? "N/D"), source, updatedAt },
    { label: "Modo da análise", value: prediction.coverage.analysis_mode === "individualized" ? "Individual por confronto" : "Média genérica", source, updatedAt },
    { label: "Dados adicionais", value: prediction.coverage.raw_prediction_features ? "Disponível" : "Somente calendário", source, updatedAt },
    { label: "Probabilidades provedor", value: "Ignoradas", source, updatedAt }
  ];
}

export function mapBetvisionPredictionToMatch(prediction: BetvisionAiPrediction, date: string): Match {
  const fixtureId = prediction.fixture_id ?? Number(prediction.generated_at.replace(/\D/g, "").slice(-8));
  const names = splitMatchName(prediction.match);
  const meta = prediction.fixture_meta ?? {};
  const homeTeam = team(names.home, "home", fixtureId, meta.home_id, meta.home_logo);
  const awayTeam = team(names.away, "away", fixtureId, meta.away_id, meta.away_logo);
  const updatedAt = prediction.generated_at;

  return {
    id: `ai-${fixtureId}`,
    apiFixtureId: fixtureId,
    leagueId: meta.league_id ?? 1,
    season: meta.season ?? 2026,
    status: meta.status ?? "NS",
    coverage: {
      predictions: true,
      odds: false,
      fixtureStatistics: false,
      events: false,
      lineups: false,
      playerStatistics: prediction.player_props.length > 0,
      teamStatistics: Boolean(prediction.coverage.raw_prediction_features)
    },
    dataUpdatedAt: updatedAt,
    competition: translateCompetition(meta.league_name ?? "World Cup"),
    round: meta.round ?? "Projeção da IA",
    startsAt: meta.starts_at ?? `${prediction._source_date ?? date}T12:00:00-03:00`,
    venue: meta.venue ?? "A confirmar",
    homeTeam,
    awayTeam,
    markets: [
      ...mapResultMarkets(prediction, names),
      ...mapDoubleChanceMarkets(prediction, names),
      ...mapGoalsMarkets(prediction),
      ...mapBackendStrongestMarket(prediction),
      ...mapCountMarkets(prediction),
      ...mapHandicapMarkets(prediction, names.home)
    ],
    playerProps: [],
    players: [],
    projectedScore: scoreProjection(prediction),
    projections: {
      shots: {
        home: prediction.expected.home_shots.toFixed(2),
        away: prediction.expected.away_shots.toFixed(2),
        total: (prediction.expected.home_shots + prediction.expected.away_shots).toFixed(2)
      },
      shotsOnTarget: {
        home: prediction.expected.home_shots_on_target.toFixed(2),
        away: prediction.expected.away_shots_on_target.toFixed(2)
      },
      corners: {
        home: prediction.expected.home_corners.toFixed(2),
        away: prediction.expected.away_corners.toFixed(2)
      },
      fouls: {
        home: prediction.expected.home_fouls.toFixed(2),
        away: prediction.expected.away_fouls.toFixed(2)
      }
    },
    realStats: [
      ...(prediction.user_analysis?.summary
        ? [{ label: "Resumo", value: prediction.user_analysis.summary, source, updatedAt }]
        : []),
      ...realStats(prediction, updatedAt)
    ]
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), backendConfig.betvisionAi.requestTimeoutMs);
  try {
    const response = await fetch(`${backendConfig.betvisionAi.baseUrl}${path}`, {
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`A IA da BetVision respondeu HTTP ${response.status}.`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getBetvisionAiFixturesByDate(date: string) {
  if (!backendConfig.betvisionAi.configured) {
    return [];
  }
  const payload = await fetchJson<PredictionsPayload>(`/predictions?date=${encodeURIComponent(date)}`);
  return payload.predictions.map((prediction) => mapBetvisionPredictionToMatch(prediction, payload.date));
}

export async function getBetvisionAiMatchAnalysis(fixtureId: number) {
  const payload = await fetchJson<{ prediction: BetvisionAiPrediction }>(`/prediction/${fixtureId}`);
  return mapBetvisionPredictionToMatch(payload.prediction, payload.prediction._source_date ?? new Date().toISOString().slice(0, 10));
}

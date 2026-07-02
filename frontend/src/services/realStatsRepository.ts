import AsyncStorage from "@react-native-async-storage/async-storage";
import { backendConfig } from "@/config/backend";
import { featuredLeagueIds, sortFeaturedMatches } from "@/data/featuredLeagues";
import {
  ApiSportsEvent,
  ApiSportsFixture,
  ApiSportsFixtureStatistics,
  ApiSportsLineup,
  ApiSportsOddsFixture,
  ApiSportsPrediction,
  ApiSportsPredictionTeam,
  apiFootballGet
} from "@/services/sportsApi";
import { DataSourceKind, FixtureCoverage, MarketProbability, Match, Player, PlayerProp, RealStatValue, Team } from "@/types/domain";

const cachePrefix = `betvision:real-stats:${backendConfig.sportsApi.cacheVersion}:`;
const ttl = {
  fixtures: 20 * 60 * 1000,
  match: 60 * 60 * 1000,
  odds: 3 * 60 * 60 * 1000,
  live: 5 * 60 * 1000
};

type CacheEnvelope<T> = {
  expiresAt: number;
  data: T;
};

type RealMatchDataset = {
  fixture: ApiSportsFixture;
  prediction?: ApiSportsPrediction;
  odds?: ApiSportsOddsFixture[];
  fixtureStatistics?: ApiSportsFixtureStatistics[];
  events?: ApiSportsEvent[];
  lineups?: ApiSportsLineup[];
  updatedAt: string;
};

type RealFixturesFilters = {
  league?: number;
  leagueIds?: number[];
  timezone?: string;
  force?: boolean;
  limit?: number;
  includeProbabilities?: boolean;
};

function cacheKey(key: string) {
  return `${cachePrefix}${key}`;
}

async function getCached<T>(key: string): Promise<T | undefined> {
  const raw = await AsyncStorage.getItem(cacheKey(key));
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (parsed.expiresAt < Date.now()) {
      await AsyncStorage.removeItem(cacheKey(key));
      return undefined;
    }
    return parsed.data;
  } catch {
    await AsyncStorage.removeItem(cacheKey(key));
    return undefined;
  }
}

async function setCached<T>(key: string, data: T, duration: number) {
  const payload: CacheEnvelope<T> = {
    expiresAt: Date.now() + duration,
    data
  };
  await AsyncStorage.setItem(cacheKey(key), JSON.stringify(payload));
}

function percentToNumber(value?: string) {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value.replace("%", "").trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

function oddToProbability(value?: string) {
  const odd = Number(value);
  if (!Number.isFinite(odd) || odd <= 1) {
    return undefined;
  }
  return {
    odd,
    probability: Math.round((1 / odd) * 100)
  };
}

function normalizeOdds(values: Array<{ key: string; odd: number }>) {
  const total = values.reduce((sum, item) => sum + 1 / item.odd, 0);
  if (!total) {
    return undefined;
  }
  return Object.fromEntries(values.map((item) => [item.key, Math.round(((1 / item.odd) / total) * 100)]));
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

function buildTeam(team: ApiSportsFixture["teams"]["home"], side: "home" | "away"): Team {
  return {
    id: `api-team-${team.id}`,
    name: team.name,
    countryCode: team.code ?? team.country?.slice(0, 3).toUpperCase() ?? (side === "home" ? "HOM" : "AWY"),
    flag: team.logo ?? "",
    accentColor: side === "home" ? "#3b82f6" : "#cbd5e1",
    form: []
  };
}

function formFromPredictionTeam(team?: ApiSportsPredictionTeam) {
  const form = team?.league?.form ?? "";
  return form ? form.slice(-5).split("") : [];
}

function getTeamGoalsAverage(team: ApiSportsPredictionTeam | undefined, direction: "for" | "against" = "for") {
  const raw = direction === "for" ? team?.league?.goals?.for?.average?.total : team?.league?.goals?.against?.average?.total;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getPlayed(team?: ApiSportsPredictionTeam) {
  return team?.league?.fixtures?.played?.total ?? team?.last_5?.played ?? 0;
}

function overRate(team: ApiSportsPredictionTeam | undefined, line: "1.5" | "2.5" | "3.5") {
  const over = team?.league?.goals?.for?.under_over?.[line]?.over ?? 0;
  const played = getPlayed(team);
  if (!played) {
    return undefined;
  }
  return over / played;
}

function computedProbability(value: number) {
  return Math.max(5, Math.min(95, Math.round(value)));
}

function findOddsMarket(odds: ApiSportsOddsFixture[] | undefined, names: string[]) {
  for (const fixtureOdds of odds ?? []) {
    for (const bookmaker of fixtureOdds.bookmakers ?? []) {
      for (const bet of bookmaker.bets ?? []) {
        const betName = bet.name?.toLowerCase() ?? "";
        if (names.some((name) => betName.includes(name))) {
          return { bookmaker: bookmaker.name, bet };
        }
      }
    }
  }
  return undefined;
}

function valueMatches(value: string, candidates: string[]) {
  const normalized = value.toLowerCase().trim();
  return candidates.some((candidate) => normalized === candidate || normalized.includes(candidate));
}

function buildResultMarketsFromOdds(dataset: RealMatchDataset): MarketProbability[] {
  const resultMarket = findOddsMarket(dataset.odds, ["match winner", "fulltime result", "1x2"]);
  const values = resultMarket?.bet?.values ?? [];
  const homeName = dataset.fixture.teams.home.name;
  const awayName = dataset.fixture.teams.away.name;
  const normalizedValues: Array<{ key: string; odd: number }> = [];

  for (const value of values) {
    const odd = Number(value.odd);
    if (!Number.isFinite(odd) || odd <= 1 || !value.value) {
      continue;
    }
    if (valueMatches(value.value, ["home", "1", homeName.toLowerCase()])) {
      normalizedValues.push({ key: "home", odd });
    } else if (valueMatches(value.value, ["draw", "x", "empate"])) {
      normalizedValues.push({ key: "draw", odd });
    } else if (valueMatches(value.value, ["away", "2", awayName.toLowerCase()])) {
      normalizedValues.push({ key: "away", odd });
    }
  }

  const probabilities = normalizedValues.length >= 3 ? normalizeOdds(normalizedValues) : undefined;
  const home = probabilities?.home;
  const draw = probabilities?.draw;
  const away = probabilities?.away;

  if (home === undefined || draw === undefined || away === undefined) {
    return [];
  }

  return [
    { id: "odds-home-win", category: "result", label: `Vitoria ${homeName}`, probability: home, side: "home", source: "odds", strength: sourceStrength(home) },
    { id: "odds-draw", category: "result", label: "Empate", probability: draw, source: "odds", strength: sourceStrength(draw) },
    { id: "odds-away-win", category: "result", label: `Vitoria ${awayName}`, probability: away, side: "away", source: "odds", strength: sourceStrength(away) }
  ];
}

function buildDoubleChanceFromOdds(dataset: RealMatchDataset): MarketProbability[] {
  const market = findOddsMarket(dataset.odds, ["double chance"]);
  const homeName = dataset.fixture.teams.home.name;
  const awayName = dataset.fixture.teams.away.name;
  const mapped: Array<{ key: string; label: string; odd: number }> = [];

  for (const value of market?.bet?.values ?? []) {
    const odd = Number(value.odd);
    const raw = value.value ?? "";
    if (!Number.isFinite(odd) || odd <= 1) {
      continue;
    }
    const lower = raw.toLowerCase();
    if (lower.includes("1x") || lower.includes("home/draw") || lower.includes("home or draw") || lower.includes(`${homeName.toLowerCase()}/draw`)) {
      mapped.push({ key: "homeDraw", label: `${homeName} ou empate`, odd });
    } else if (lower.includes("x2") || lower.includes("draw/away") || lower.includes("draw or away") || lower.includes(`draw/${awayName.toLowerCase()}`)) {
      mapped.push({ key: "awayDraw", label: `${awayName} ou empate`, odd });
    } else if (lower.includes("12") || lower.includes("home/away") || lower.includes("home or away")) {
      mapped.push({ key: "noDraw", label: `${homeName} ou ${awayName}`, odd });
    }
  }

  const probabilities = mapped.length >= 3 ? normalizeOdds(mapped.map((item) => ({ key: item.key, odd: item.odd }))) : undefined;
  if (!probabilities) {
    return [];
  }

  return mapped.map((item) => {
    const probability = probabilities[item.key] ?? 0;
    return {
      id: `odds-double-${item.key}`,
      category: "doubleChance" as const,
      label: item.label,
      probability,
      source: "odds" as const,
      strength: sourceStrength(probability)
    };
  });
}

function buildResultMarkets(dataset: RealMatchDataset): MarketProbability[] {
  const oddsResult = buildResultMarketsFromOdds(dataset);
  if (oddsResult.length) {
    return oddsResult;
  }

  const percent = dataset.prediction?.predictions?.percent;
  const home = percentToNumber(percent?.home);
  const draw = percentToNumber(percent?.draw);
  const away = percentToNumber(percent?.away);
  const homeName = dataset.fixture.teams.home.name;
  const awayName = dataset.fixture.teams.away.name;

  if (home === undefined || draw === undefined || away === undefined) {
    return [
      { id: "result-unavailable", category: "result", label: "Resultado indisponivel na API", probability: 0, source: "unavailable", strength: "risky" }
    ];
  }

  return [
    { id: "api-home-win", category: "result", label: `Vitoria ${homeName}`, probability: home, side: "home", source: "api-football", strength: sourceStrength(home) },
    { id: "api-draw", category: "result", label: "Empate", probability: draw, source: "api-football", strength: sourceStrength(draw) },
    { id: "api-away-win", category: "result", label: `Vitoria ${awayName}`, probability: away, side: "away", source: "api-football", strength: sourceStrength(away) }
  ];
}

function buildDoubleChanceMarkets(dataset: RealMatchDataset, resultMarkets: MarketProbability[]): MarketProbability[] {
  const oddsDoubleChance = buildDoubleChanceFromOdds(dataset);
  if (oddsDoubleChance.length) {
    return oddsDoubleChance;
  }

  const home = resultMarkets.find((market) => market.side === "home")?.probability;
  const draw = resultMarkets.find((market) => market.label.toLowerCase() === "empate")?.probability;
  const away = resultMarkets.find((market) => market.side === "away")?.probability;
  const homeName = dataset.fixture.teams.home.name;
  const awayName = dataset.fixture.teams.away.name;

  if (home === undefined || draw === undefined || away === undefined) {
    return [
      { id: "double-unavailable", category: "doubleChance", label: "Dupla chance indisponivel", probability: 0, source: "unavailable", strength: "risky" }
    ];
  }

  return [
    { id: "derived-home-draw", category: "doubleChance", label: `${homeName} ou empate`, probability: computedProbability(home + draw), side: "home", source: "computed-real", strength: sourceStrength(home + draw) },
    { id: "derived-away-draw", category: "doubleChance", label: `${awayName} ou empate`, probability: computedProbability(away + draw), side: "away", source: "computed-real", strength: sourceStrength(away + draw) },
    { id: "derived-no-draw", category: "doubleChance", label: `${homeName} ou ${awayName}`, probability: computedProbability(home + away), source: "computed-real", strength: sourceStrength(home + away) }
  ];
}

function buildOddsMarkets(dataset: RealMatchDataset): MarketProbability[] {
  const markets: MarketProbability[] = [];
  const goalsMarket = findOddsMarket(dataset.odds, ["goals over/under", "over/under", "total"]);

  if (goalsMarket) {
    const byLine = new Map<string, Array<{ key: string; label: string; odd: number }>>();
    for (const value of goalsMarket.bet?.values ?? []) {
      const name = value.value ?? "";
      const odd = Number(value.odd);
      const line = name.match(/(1\.5|2\.5|3\.5)/i)?.[1];
      const direction = name.toLowerCase().includes("over") ? "over" : name.toLowerCase().includes("under") ? "under" : undefined;
      if (!line || !direction || !Number.isFinite(odd) || odd <= 1) {
        continue;
      }
      const current = byLine.get(line) ?? [];
      current.push({ key: direction, label: name, odd });
      byLine.set(line, current);
    }

    for (const [line, values] of byLine.entries()) {
      const probabilities = values.length >= 2 ? normalizeOdds(values.map((item) => ({ key: item.key, odd: item.odd }))) : undefined;
      const overValue = values.find((item) => item.key === "over");
      const probability = probabilities?.over;
      if (!overValue || probability === undefined) {
        continue;
      }
      markets.push({
        id: `odds-goals-over-${line}`,
        category: "goals",
        label: `Over ${line} gols`,
        probability,
        source: "odds",
        rawOdd: overValue.odd,
        bookmaker: goalsMarket.bookmaker,
        strength: sourceStrength(probability)
      });
    }
  }

  const bttsMarket = findOddsMarket(dataset.odds, ["both teams score", "both teams to score"]);
  if (bttsMarket) {
    const values = (bttsMarket.bet?.values ?? [])
      .map((value) => ({ key: value.value?.toLowerCase().includes("yes") || value.value?.toLowerCase().includes("sim") ? "yes" : "no", odd: Number(value.odd) }))
      .filter((value) => Number.isFinite(value.odd) && value.odd > 1);
    const probabilities = values.length >= 2 ? normalizeOdds(values) : undefined;
    const yesOdd = values.find((value) => value.key === "yes")?.odd;
    const yesProbability = probabilities?.yes;
    if (yesOdd && yesProbability !== undefined) {
      markets.push({
        id: "odds-btts-yes",
        category: "goals",
        label: "Ambas marcam (SIM)",
        probability: yesProbability,
        source: "odds",
        rawOdd: yesOdd,
        bookmaker: bttsMarket.bookmaker,
        strength: sourceStrength(yesProbability)
      });
    }
  }

  return markets;
}

function buildComputedMarkets(dataset: RealMatchDataset): MarketProbability[] {
  const home = dataset.prediction?.teams?.home;
  const away = dataset.prediction?.teams?.away;
  const homeFor = getTeamGoalsAverage(home, "for") ?? 1;
  const awayFor = getTeamGoalsAverage(away, "for") ?? 1;
  const homeAgainst = getTeamGoalsAverage(home, "against") ?? 1;
  const awayAgainst = getTeamGoalsAverage(away, "against") ?? 1;
  const expectedGoals = Math.max(0.4, (homeFor + awayFor + homeAgainst + awayAgainst) / 2);
  const over15 = computedProbability(44 + expectedGoals * 12);
  const over25 = computedProbability(24 + expectedGoals * 13);
  const over35 = computedProbability(10 + expectedGoals * 10);
  const btts = computedProbability(34 + Math.min(homeFor, awayFor) * 15 + Math.min(homeAgainst, awayAgainst) * 8);
  const homeOver25Rate = overRate(home, "2.5") ?? 0.45;
  const awayOver25Rate = overRate(away, "2.5") ?? 0.45;
  const note = "Estimativa transparente usando medias de gols, forma recente e team statistics da API.";

  return [
    { id: "computed-over-15", category: "goals", label: "Over 1.5 gols", probability: over15, source: "computed-real", strength: sourceStrength(over15), calculationNote: note },
    { id: "computed-over-25", category: "goals", label: "Over 2.5 gols", probability: Math.max(over25, computedProbability((homeOver25Rate + awayOver25Rate) * 50)), source: "computed-real", strength: sourceStrength(over25), calculationNote: note },
    { id: "computed-over-35", category: "goals", label: "Over 3.5 gols", probability: over35, source: "computed-real", strength: sourceStrength(over35), calculationNote: note },
    { id: "computed-btts-yes", category: "goals", label: "Ambas marcam (SIM)", probability: btts, source: "computed-real", strength: sourceStrength(btts), calculationNote: note },
    { id: "computed-btts-no", category: "goals", label: "Ambas marcam (NAO)", probability: 100 - btts, source: "computed-real", strength: sourceStrength(100 - btts), calculationNote: note }
  ];
}

function statValue(stats: ApiSportsFixtureStatistics[] | undefined, teamId: number, type: string) {
  const teamStats = stats?.find((item) => item.team?.id === teamId);
  const raw = teamStats?.statistics?.find((item) => item.type?.toLowerCase() === type.toLowerCase())?.value;
  if (raw === null || raw === undefined) {
    return undefined;
  }
  if (typeof raw === "number") {
    return raw;
  }
  const parsed = Number(String(raw).replace("%", ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildFixtureStatMarkets(dataset: RealMatchDataset): MarketProbability[] {
  const stats = dataset.fixtureStatistics;
  if (!stats?.length) {
    return [
      { id: "shots-unavailable", category: "shots", label: "Chutes indisponiveis", probability: 0, source: "unavailable", strength: "risky" },
      { id: "corners-unavailable", category: "corners", label: "Escanteios indisponiveis", probability: 0, source: "unavailable", strength: "risky" },
      { id: "cards-unavailable", category: "cards", label: "Cartoes indisponiveis", probability: 0, source: "unavailable", strength: "risky" }
    ];
  }

  const homeId = dataset.fixture.teams.home.id;
  const awayId = dataset.fixture.teams.away.id;
  const totalShots = (statValue(stats, homeId, "Total Shots") ?? 0) + (statValue(stats, awayId, "Total Shots") ?? 0);
  const shotsOnGoal = (statValue(stats, homeId, "Shots on Goal") ?? 0) + (statValue(stats, awayId, "Shots on Goal") ?? 0);
  const corners = (statValue(stats, homeId, "Corner Kicks") ?? 0) + (statValue(stats, awayId, "Corner Kicks") ?? 0);
  const yellowCards = (statValue(stats, homeId, "Yellow Cards") ?? 0) + (statValue(stats, awayId, "Yellow Cards") ?? 0);

  return [
    { id: "real-shots-total", category: "shots", label: `Chutes reais: ${totalShots}`, probability: totalShots >= 20 ? 100 : 0, source: "api-football", strength: totalShots >= 20 ? "strong" : "risky", calculationNote: "Dado do endpoint fixtures/statistics." },
    { id: "real-sot-total", category: "shotsOnTarget", label: `Chutes no gol reais: ${shotsOnGoal}`, probability: shotsOnGoal >= 7 ? 100 : 0, source: "api-football", strength: shotsOnGoal >= 7 ? "strong" : "risky", calculationNote: "Dado do endpoint fixtures/statistics." },
    { id: "real-corners-total", category: "corners", label: `Escanteios reais: ${corners}`, probability: corners >= 8 ? 100 : 0, source: "api-football", strength: corners >= 8 ? "strong" : "risky", calculationNote: "Dado do endpoint fixtures/statistics." },
    { id: "real-cards-total", category: "cards", label: `Cartoes amarelos reais: ${yellowCards}`, probability: yellowCards >= 3 ? 100 : 0, source: "api-football", strength: yellowCards >= 3 ? "strong" : "risky", calculationNote: "Dado do endpoint fixtures/statistics." }
  ];
}

export function computeMarketsFromRealStats(dataset: RealMatchDataset): MarketProbability[] {
  const result = buildResultMarkets(dataset);
  const doubleChance = buildDoubleChanceMarkets(dataset, result);
  const odds = buildOddsMarkets(dataset);
  const unavailable: MarketProbability[] = [];

  if (!odds.some((market) => market.category === "goals")) {
    unavailable.push({ id: "goals-unavailable", category: "goals", label: "Mercado de gols sem odds disponiveis", probability: 0, source: "unavailable", strength: "risky" });
  }

  if (!dataset.fixtureStatistics?.length) {
    unavailable.push(
      { id: "shots-unavailable", category: "shots", label: "Chutes sem estatistica oficial", probability: 0, source: "unavailable", strength: "risky" },
      { id: "corners-unavailable", category: "corners", label: "Escanteios sem estatistica oficial", probability: 0, source: "unavailable", strength: "risky" },
      { id: "cards-unavailable", category: "cards", label: "Cartoes sem estatistica oficial", probability: 0, source: "unavailable", strength: "risky" },
      { id: "handicap-unavailable", category: "handicap", label: "Handicap sem odds disponiveis", probability: 0, source: "unavailable", strength: "risky" }
    );
  }

  return [...result, ...doubleChance, ...odds, ...unavailable];
}

function getProjectedScore(dataset: RealMatchDataset) {
  const goals = dataset.prediction?.predictions?.goals;
  const homeRaw = goals?.home?.replace("+", "") ?? "";
  const awayRaw = goals?.away?.replace("+", "") ?? "";
  const hasProjection =
    Boolean(goals?.home || goals?.away) ||
    dataset.fixture.goals?.home !== null && dataset.fixture.goals?.home !== undefined ||
    dataset.fixture.goals?.away !== null && dataset.fixture.goals?.away !== undefined;
  const home = Math.max(0, Math.round(Math.abs(Number(homeRaw)) || dataset.fixture.goals?.home || 0));
  const away = Math.max(0, Math.round(Math.abs(Number(awayRaw)) || dataset.fixture.goals?.away || 0));
  return {
    home,
    away,
    alternatives: hasProjection ? [`${home}x${away}`] : []
  };
}

function buildPlayers(dataset: RealMatchDataset): Player[] {
  const lineups = dataset.lineups ?? [];
  const players = lineups.flatMap((lineup) =>
    (lineup.startXI ?? []).slice(0, 3).map((item) => ({
      id: `api-player-${item.player?.id ?? item.player?.name}`,
      teamId: `api-team-${lineup.team?.id}`,
      name: item.player?.name ?? "Jogador",
      position: item.player?.pos ?? "N/D",
      headline: "Escalacao oficial API-FOOTBALL"
    }))
  );

  if (players.length) {
    return players;
  }

  return [
    { id: `${dataset.fixture.fixture.id}-home-team`, teamId: `api-team-${dataset.fixture.teams.home.id}`, name: dataset.fixture.teams.home.name, position: "Equipe", headline: "Props de jogador indisponiveis" },
    { id: `${dataset.fixture.fixture.id}-away-team`, teamId: `api-team-${dataset.fixture.teams.away.id}`, name: dataset.fixture.teams.away.name, position: "Equipe", headline: "Props de jogador indisponiveis" }
  ];
}

function buildPlayerProps(players: Player[], source: DataSourceKind): PlayerProp[] {
  return players.map((player) => ({
    id: `${player.id}-availability`,
    playerId: player.id,
    teamId: player.teamId,
    label: source === "api-football" ? "Escalado" : "Estatistica individual indisponivel",
    probability: source === "api-football" ? 100 : 0,
    source,
    calculationNote: source === "api-football" ? "Jogador vindo de fixtures/lineups." : "Endpoint de jogadores sem cobertura para esta partida."
  }));
}

function buildRealStats(dataset: RealMatchDataset): RealStatValue[] {
  const updatedAt = dataset.updatedAt;
  const home = dataset.prediction?.teams?.home;
  const away = dataset.prediction?.teams?.away;
  const comparison = dataset.prediction?.comparison ?? {};
  return [
    { label: "Previsao", value: dataset.prediction?.predictions?.advice ?? "Indisponivel", source: dataset.prediction ? "api-football" : "unavailable", updatedAt },
    { label: "Forma mandante", value: home?.league?.form ?? home?.last_5?.form ?? "Indisponivel", source: home ? "api-football" : "unavailable", updatedAt },
    { label: "Forma visitante", value: away?.league?.form ?? away?.last_5?.form ?? "Indisponivel", source: away ? "api-football" : "unavailable", updatedAt },
    { label: "Comparacao ataque", value: comparison.att ? `${comparison.att.home ?? "-"} x ${comparison.att.away ?? "-"}` : "Indisponivel", source: comparison.att ? "api-football" : "unavailable", updatedAt },
    { label: "H2H disponivel", value: dataset.prediction?.h2h?.length ?? 0, source: dataset.prediction?.h2h?.length ? "api-football" : "unavailable", updatedAt },
    { label: "Odds encontradas", value: dataset.odds?.length ?? 0, source: dataset.odds?.length ? "odds" : "unavailable", updatedAt },
    { label: "Estatisticas da partida", value: dataset.fixtureStatistics?.length ? "Disponivel" : "Indisponivel", source: dataset.fixtureStatistics?.length ? "api-football" : "unavailable", updatedAt }
  ];
}

function coverageFromDataset(dataset: RealMatchDataset): FixtureCoverage {
  return {
    predictions: Boolean(dataset.prediction),
    odds: Boolean(dataset.odds?.length),
    fixtureStatistics: Boolean(dataset.fixtureStatistics?.length),
    events: Boolean(dataset.events?.length),
    lineups: Boolean(dataset.lineups?.length),
    playerStatistics: Boolean(dataset.lineups?.length),
    teamStatistics: Boolean(dataset.prediction?.teams?.home?.league || dataset.prediction?.teams?.away?.league)
  };
}

function mapDatasetToMatch(dataset: RealMatchDataset): Match {
  const homeTeam = buildTeam(dataset.fixture.teams.home, "home");
  const awayTeam = buildTeam(dataset.fixture.teams.away, "away");
  homeTeam.form = formFromPredictionTeam(dataset.prediction?.teams?.home);
  awayTeam.form = formFromPredictionTeam(dataset.prediction?.teams?.away);
  const players = buildPlayers(dataset);
  const coverage = coverageFromDataset(dataset);
  const markets = computeMarketsFromRealStats(dataset);
  const realStats = buildRealStats(dataset);
  const projectedScore = getProjectedScore(dataset);

  return {
    id: `api-${dataset.fixture.fixture.id}`,
    apiFixtureId: dataset.fixture.fixture.id,
    leagueId: dataset.fixture.league.id,
    season: dataset.fixture.league.season,
    status: dataset.fixture.fixture.status?.short,
    coverage,
    dataUpdatedAt: dataset.updatedAt,
    competition: dataset.fixture.league.name,
    round: dataset.fixture.league.round ?? `Liga ${dataset.fixture.league.id}`,
    startsAt: dataset.fixture.fixture.date,
    venue: dataset.fixture.fixture.venue?.name ?? "Estadio a confirmar",
    homeTeam,
    awayTeam,
    markets,
    playerProps: buildPlayerProps(players, coverage.lineups ? "api-football" : "unavailable"),
    players,
    projectedScore,
    projections: {
      shots: { home: statValue(dataset.fixtureStatistics, dataset.fixture.teams.home.id, "Total Shots")?.toString() ?? "Indisponivel", away: statValue(dataset.fixtureStatistics, dataset.fixture.teams.away.id, "Total Shots")?.toString() ?? "Indisponivel", total: "Disponivel somente para jogos com fixtures/statistics" },
      shotsOnTarget: { home: statValue(dataset.fixtureStatistics, dataset.fixture.teams.home.id, "Shots on Goal")?.toString() ?? "Indisponivel", away: statValue(dataset.fixtureStatistics, dataset.fixture.teams.away.id, "Shots on Goal")?.toString() ?? "Indisponivel" },
      corners: { home: statValue(dataset.fixtureStatistics, dataset.fixture.teams.home.id, "Corner Kicks")?.toString() ?? "Indisponivel", away: statValue(dataset.fixtureStatistics, dataset.fixture.teams.away.id, "Corner Kicks")?.toString() ?? "Indisponivel" },
      fouls: { home: statValue(dataset.fixtureStatistics, dataset.fixture.teams.home.id, "Fouls")?.toString() ?? "Indisponivel", away: statValue(dataset.fixtureStatistics, dataset.fixture.teams.away.id, "Fouls")?.toString() ?? "Indisponivel" }
    },
    realStats
  };
}

function mapFixtureOnly(item: ApiSportsFixture): Match {
  const dataset: RealMatchDataset = {
    fixture: item,
    updatedAt: new Date().toISOString()
  };
  return {
    ...mapDatasetToMatch(dataset),
    markets: [],
    realStats: [
      { label: "Fixture", value: "Real", source: "api-football", updatedAt: dataset.updatedAt },
      { label: "Analise completa", value: "Carregada sob demanda", source: "unavailable", updatedAt: dataset.updatedAt }
    ],
    coverage: {
      predictions: false,
      odds: false,
      fixtureStatistics: false,
      events: false,
      lineups: false,
      playerStatistics: false,
      teamStatistics: false
    }
  };
}

async function getFixtureById(fixtureId: number) {
  const payload = await apiFootballGet<ApiSportsFixture[]>("fixtures", { id: fixtureId });
  const fixture = payload.response[0];
  if (!fixture) {
    throw new Error("Partida nao encontrada na API.");
  }
  return fixture;
}

async function safeGet<T>(key: string, duration: number, loader: () => Promise<T>, fallback: T): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== undefined) {
    return cached;
  }
  try {
    const data = await loader();
    await setCached(key, data, duration);
    return data;
  } catch {
    await setCached(key, fallback, Math.min(duration, 10 * 60 * 1000));
    return fallback;
  }
}

async function mapFixtureWithOfficialPrediction(item: ApiSportsFixture) {
  const prediction = await safeGet<ApiSportsPrediction | undefined>(
    `prediction:${item.fixture.id}`,
    ttl.match,
    async () => (await apiFootballGet<ApiSportsPrediction[]>("predictions", { fixture: item.fixture.id })).response[0],
    undefined
  );
  const odds = await safeGet<ApiSportsOddsFixture[]>(
    `odds:${item.fixture.id}`,
    ttl.odds,
    async () => (await apiFootballGet<ApiSportsOddsFixture[]>("odds", { fixture: item.fixture.id })).response,
    []
  );

  return mapDatasetToMatch({
    fixture: item,
    prediction,
    odds,
    updatedAt: new Date().toISOString()
  });
}

export async function getRealFixturesByDate(date: string, filters: RealFixturesFilters = {}) {
  const allowedLeagueIds = filters.leagueIds?.length ? filters.leagueIds : filters.league ? [filters.league] : featuredLeagueIds;
  const leagueKey = allowedLeagueIds.join("-");
  const requestLeague = filters.league ?? (allowedLeagueIds.length === 1 ? allowedLeagueIds[0] : undefined);
  const key = `fixtures:${date}:${leagueKey}:${filters.timezone ?? "default"}:${filters.includeProbabilities ? "with-probabilities" : "fixtures-only"}`;
  if (!filters.force) {
    const cached = await getCached<Match[]>(key);
    if (cached) {
      return cached;
    }
  }

  const payload = await apiFootballGet<ApiSportsFixture[]>("fixtures", {
    date,
    league: requestLeague,
    timezone: filters.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const allowed = new Set(allowedLeagueIds);
  const fixtures = payload.response
    .filter((item) => allowed.has(item.league.id))
    .sort((a, b) => {
      const sorted = sortFeaturedMatches([
        { leagueId: a.league.id, startsAt: a.fixture.date },
        { leagueId: b.league.id, startsAt: b.fixture.date }
      ]);
      return sorted[0].leagueId === a.league.id && sorted[0].startsAt === a.fixture.date ? -1 : 1;
    })
    .slice(0, filters.limit ?? backendConfig.sportsApi.defaultFixtureLimit);
  const matches = filters.includeProbabilities
    ? await Promise.all(fixtures.map(mapFixtureWithOfficialPrediction))
    : fixtures.map(mapFixtureOnly);

  await setCached(key, matches, ttl.fixtures);
  return matches;
}

export async function getRealMatchAnalysis(fixtureId: number) {
  const key = `match:${fixtureId}`;
  const cached = await getCached<Match>(key);
  if (cached) {
    return cached;
  }

  const fixture = await getFixtureById(fixtureId);
  const prediction = await safeGet<ApiSportsPrediction | undefined>(
    `prediction:${fixtureId}`,
    ttl.match,
    async () => (await apiFootballGet<ApiSportsPrediction[]>("predictions", { fixture: fixtureId })).response[0],
    undefined
  );
  const odds = await safeGet<ApiSportsOddsFixture[]>(
    `odds:${fixtureId}`,
    ttl.odds,
    async () => (await apiFootballGet<ApiSportsOddsFixture[]>("odds", { fixture: fixtureId })).response,
    []
  );
  const fixtureStatistics = await safeGet<ApiSportsFixtureStatistics[]>(
    `fixture-statistics:${fixtureId}`,
    ttl.live,
    async () => (await apiFootballGet<ApiSportsFixtureStatistics[]>("fixtures/statistics", { fixture: fixtureId })).response,
    []
  );
  const events = await safeGet<ApiSportsEvent[]>(
    `events:${fixtureId}`,
    ttl.live,
    async () => (await apiFootballGet<ApiSportsEvent[]>("fixtures/events", { fixture: fixtureId })).response,
    []
  );
  const lineups = await safeGet<ApiSportsLineup[]>(
    `lineups:${fixtureId}`,
    ttl.match,
    async () => (await apiFootballGet<ApiSportsLineup[]>("fixtures/lineups", { fixture: fixtureId })).response,
    []
  );

  const match = mapDatasetToMatch({
    fixture,
    prediction,
    odds,
    fixtureStatistics,
    events,
    lineups,
    updatedAt: new Date().toISOString()
  });
  await setCached(key, match, ttl.match);
  return match;
}

export async function getRealMarkets(fixtureId: number) {
  return (await getRealMatchAnalysis(fixtureId)).markets;
}

export async function getFixtureLiveStats(fixtureId: number) {
  return getCached<ApiSportsFixtureStatistics[]>(`fixture-statistics:${fixtureId}`);
}

export async function clearRealStatsCache() {
  const keys = await AsyncStorage.getAllKeys();
  const ownKeys = keys.filter((key) => key.startsWith(cachePrefix));
  if (ownKeys.length) {
    await AsyncStorage.multiRemove(ownKeys);
  }
}

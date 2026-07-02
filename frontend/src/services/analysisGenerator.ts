import { BetSlipSuggestion, DataSourceKind, Match, MatchAnalysis, MarketCategory, MarketProbability } from "@/types/domain";

const categoryTitles: Record<MarketCategory, string> = {
  result: "Probabilidades do Resultado",
  doubleChance: "Dupla Chance",
  goals: "Mercado de Gols",
  shots: "Chutes Totais",
  shotsOnTarget: "Chutes no Gol",
  corners: "Escanteios",
  fouls: "Faltas",
  cards: "Cartões",
  handicap: "Handicap Asiático",
  player: "Jogadores"
};

function byCategory(match: Match, category: MarketCategory) {
  return match.markets.filter((market) => market.category === category);
}

function unavailableRow(label = "Dados indisponíveis para esta partida") {
  return [{ label, probability: 0, source: "unavailable" as DataSourceKind }];
}

function hasUsableSource(market: MarketProbability) {
  return market.source !== "unavailable" && market.probability > 0;
}

function topMarkets(match: Match) {
  const playerMarkets = match.playerProps.map<MarketProbability>((prop) => {
    const player = match.players.find((item) => item.id === prop.playerId);
    return {
      id: prop.id,
      category: "player",
      label: `${player?.name ?? "Jogador"} ${prop.label}`,
      probability: prop.probability,
      source: prop.source,
      calculationNote: prop.calculationNote,
      strength: prop.probability >= 75 ? "strong" : "balanced"
    };
  });

  const priority = new Set(["result", "doubleChance", "goals", "handicap", "player"]);
  return [...match.markets, ...playerMarkets]
    .filter(hasUsableSource)
    .filter((market) => priority.has(market.category))
    .filter((market) => market.probability >= 75)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 6);
}

function buildSlips(match: Match, strongMarkets: MarketProbability[]): BetSlipSuggestion[] {
  const conservativeSelections = strongMarkets
    .filter((market) => market.probability >= 75)
    .slice(0, 4)
    .map((market) => market.label);

  const homeWin = byCategory(match, "result").find((market) => market.side === "home" && hasUsableSource(market))?.label;
  const scorer = match.playerProps
    .filter((prop) => prop.label.toLowerCase().includes("marcar") && prop.probability > 0)
    .sort((a, b) => b.probability - a.probability)[0];
  const scorerName = match.players.find((player) => player.id === scorer?.playerId)?.name;
  const over25 = byCategory(match, "goals").find((market) => market.label.includes("2.5") && hasUsableSource(market))?.label;
  const corners = byCategory(match, "corners").find(hasUsableSource)?.label;

  return [
    {
      id: `${match.id}-conservative`,
      title: "Bilhete Conservador",
      tone: "conservative",
      probability: conservativeSelections.length ? Math.max(62, Math.min(78, Math.round(conservativeSelections.reduce((sum, _, index) => sum - index * 4, 74)))) : 0,
      selections: conservativeSelections.length ? conservativeSelections : ["Sem seleções fortes com dados reais suficientes"]
    },
    {
      id: `${match.id}-aggressive`,
      title: "Bilhete Agressivo",
      tone: "aggressive",
      probability: homeWin && over25 ? 31 : 0,
      selections: [
        homeWin ?? "Resultado sem dado real suficiente",
        scorerName ? `${scorerName} marca a qualquer momento` : "Mercado de jogador indisponível",
        over25 ?? "Over 2.5 indisponível",
        corners ?? "Escanteios indisponíveis"
      ]
    }
  ];
}

function marketRows(match: Match, category: MarketCategory) {
  const rows = byCategory(match, category);
  return rows.length ? rows : unavailableRow();
}

function teamName(team: Match["homeTeam"]) {
  return `${team.flag ? `${team.flag} ` : ""}${team.name}`;
}

export function generateMatchAnalysis(match: Match): MatchAnalysis {
  const homeWin = byCategory(match, "result").find((market) => market.side === "home" && hasUsableSource(market));
  const awayWin = byCategory(match, "result").find((market) => market.side === "away" && hasUsableSource(market));
  const hasRealMarkets = match.markets.some((market) => market.source && market.source !== "unavailable" && market.probability > 0);
  const favorite = homeWin && awayWin ? (homeWin.probability >= awayWin.probability ? match.homeTeam : match.awayTeam) : match.homeTeam;
  const underdog = favorite.id === match.homeTeam.id ? match.awayTeam : match.homeTeam;
  const margin = Math.abs((homeWin?.probability ?? 0) - (awayWin?.probability ?? 0));
  const favoriteNote = !homeWin || !awayWin ? "Probabilidades de resultado indisponíveis para esta partida." : margin <= 12 ? `O favoritismo de ${favorite.name} é pequeno.` : `${favorite.name} aparece com favoritismo mais claro.`;
  const strongMarkets = topMarkets(match);
  const slips = buildSlips(match, strongMarkets);
  const fixtureStatSource: DataSourceKind = match.coverage?.fixtureStatistics ? "api-football" : "unavailable";
  const hasScoreProjection = match.projectedScore.alternatives.length > 0;

  return {
    matchId: match.id,
    title: `${teamName(match.homeTeam)} x ${teamName(match.awayTeam)} - Análise aprofundada`,
    summary: hasRealMarkets
      ? `${match.homeTeam.name} e ${match.awayTeam.name} foram analisados com os dados disponíveis. ${favoriteNote}`
      : `${match.homeTeam.name} e ${match.awayTeam.name} ainda não possuem mercados reais carregados.`,
    favoriteNote,
    sections: [
      { id: "result", title: categoryTitles.result, rows: marketRows(match, "result") },
      { id: "doubleChance", title: categoryTitles.doubleChance, rows: marketRows(match, "doubleChance") },
      { id: "goals", title: categoryTitles.goals, rows: marketRows(match, "goals") },
      {
        id: "score",
        title: "Placares Mais Provaveis",
        rows: [
          {
            label: hasScoreProjection ? "Placar indicado" : "Placar projetado indisponível",
            value: hasScoreProjection ? `${match.homeTeam.name} ${match.projectedScore.home} x ${match.projectedScore.away} ${match.awayTeam.name}` : "Sem projeção de gols para esta partida",
            source: hasScoreProjection ? "api-football" : "unavailable"
          },
          ...match.projectedScore.alternatives.slice(1).map((score) => ({ label: "Alternativa", value: score, source: "api-football" as DataSourceKind }))
        ]
      },
      {
        id: "shots",
        title: categoryTitles.shots,
        rows: [
          ...marketRows(match, "shots"),
          { label: match.homeTeam.name, value: match.projections.shots.home, source: fixtureStatSource },
          { label: match.awayTeam.name, value: match.projections.shots.away, source: fixtureStatSource },
          { label: "Total", value: match.projections.shots.total, source: fixtureStatSource }
        ]
      },
      {
        id: "shotsOnTarget",
        title: categoryTitles.shotsOnTarget,
        rows: [
          ...marketRows(match, "shotsOnTarget"),
          { label: match.homeTeam.name, value: match.projections.shotsOnTarget.home, source: fixtureStatSource },
          { label: match.awayTeam.name, value: match.projections.shotsOnTarget.away, source: fixtureStatSource }
        ]
      },
      { id: "corners", title: categoryTitles.corners, rows: marketRows(match, "corners") },
      {
        id: "fouls",
        title: categoryTitles.fouls,
        rows: [
          ...marketRows(match, "fouls"),
          { label: match.homeTeam.name, value: match.projections.fouls.home, source: fixtureStatSource },
          { label: match.awayTeam.name, value: match.projections.fouls.away, source: fixtureStatSource }
        ]
      },
      { id: "cards", title: categoryTitles.cards, rows: marketRows(match, "cards") },
      { id: "handicap", title: categoryTitles.handicap, rows: marketRows(match, "handicap") }
    ],
    playerSections: [match.homeTeam, match.awayTeam].map((team) => ({
      team,
      props: match.players
        .filter((player) => player.teamId === team.id)
        .map((player) => ({
          player,
          markets: match.playerProps.filter((prop) => prop.playerId === player.id)
        }))
        .filter((item) => item.markets.length > 0)
    })),
    strongMarkets,
    slips,
    finalPick: hasScoreProjection ? `${match.homeTeam.name} ${match.projectedScore.home} x ${match.projectedScore.away} ${match.awayTeam.name}` : "Placar indisponível",
    confidence: hasRealMarkets ? (margin <= 12 ? 7.5 : 8.1) : 0,
    closingNote: hasRealMarkets
      ? `${favorite.name} tem os melhores sinais disponíveis, mas ${underdog.name} ainda pode equilibrar o jogo.`
      : "Sem dados suficientes para palpite final.",
    dataCoverage: match.coverage,
    realStats: match.realStats
  };
}

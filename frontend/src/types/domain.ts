export type MarketCategory =
  | "result"
  | "doubleChance"
  | "goals"
  | "shots"
  | "shotsOnTarget"
  | "corners"
  | "fouls"
  | "cards"
  | "handicap"
  | "player";

export type DataSourceKind = "api-football" | "odds" | "computed-real" | "unavailable";

export type RealStatValue = {
  label: string;
  value: string | number;
  source: DataSourceKind;
  updatedAt: string;
  confidence?: number;
  note?: string;
};

export type FixtureCoverage = {
  predictions?: boolean;
  odds?: boolean;
  fixtureStatistics?: boolean;
  events?: boolean;
  lineups?: boolean;
  playerStatistics?: boolean;
  teamStatistics?: boolean;
};

export type Team = {
  id: string;
  name: string;
  countryCode: string;
  flag: string;
  accentColor: string;
  fifaRank?: number;
  form: string[];
};

export type Player = {
  id: string;
  teamId: string;
  name: string;
  position: string;
  headline?: string;
};

export type MarketProbability = {
  id: string;
  category: MarketCategory;
  label: string;
  probability: number;
  side?: "home" | "away" | "neutral";
  strength?: "strong" | "balanced" | "risky";
  source?: DataSourceKind;
  rawOdd?: number;
  bookmaker?: string;
  calculationNote?: string;
};

export type PlayerProp = {
  id: string;
  playerId: string;
  teamId: string;
  label: string;
  probability: number;
  source?: DataSourceKind;
  calculationNote?: string;
};

export type BetSlipSuggestion = {
  id: string;
  title: string;
  tone: "conservative" | "aggressive";
  probability: number;
  selections: string[];
};

export type Match = {
  id: string;
  apiFixtureId?: number;
  leagueId?: number;
  season?: number;
  status?: string;
  coverage?: FixtureCoverage;
  dataUpdatedAt?: string;
  competition: string;
  round: string;
  startsAt: string;
  venue: string;
  homeTeam: Team;
  awayTeam: Team;
  markets: MarketProbability[];
  playerProps: PlayerProp[];
  players: Player[];
  projectedScore: {
    home: number;
    away: number;
    alternatives: string[];
  };
  projections: {
    shots: { home: string; away: string; total: string };
    shotsOnTarget: { home: string; away: string };
    corners: { home: string; away: string };
    fouls: { home: string; away: string };
  };
  realStats?: RealStatValue[];
};

export type AnalysisSection = {
  id: string;
  title: string;
  rows: Array<{
    label: string;
    probability?: number;
    value?: string;
    source?: DataSourceKind;
    calculationNote?: string;
    bookmaker?: string;
    rawOdd?: number;
  }>;
};

export type MatchAnalysis = {
  matchId: string;
  title: string;
  summary: string;
  favoriteNote: string;
  sections: AnalysisSection[];
  playerSections: Array<{
    team: Team;
    props: Array<{
      player: Player;
      markets: PlayerProp[];
    }>;
  }>;
  strongMarkets: MarketProbability[];
  slips: BetSlipSuggestion[];
  finalPick: string;
  confidence: number;
  closingNote: string;
  dataCoverage?: FixtureCoverage;
  realStats?: RealStatValue[];
};

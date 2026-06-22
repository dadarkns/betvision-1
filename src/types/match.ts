// Tipos relacionados a partidas de futebol

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  league: string;
  status: 'upcoming' | 'live' | 'finished';
  odds: Odds;
  statistics: MatchStatistics;
  analysis?: MatchAnalysis;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  form?: string; // Últimas 5 resultados
}

export interface Odds {
  homeWin: number;
  draw: number;
  awayWin: number;
  overUnder?: {
    over: number;
    under: number;
  };
}

export interface MatchStatistics {
  possession: {
    home: number;
    away: number;
  };
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
}

export interface MatchAnalysis {
  probability: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  prediction: string;
  confidence: number; // 0-100
}

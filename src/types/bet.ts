// Tipos relacionados a apostas e bilhetes

export interface Bet {
  id: string;
  matchId: string;
  type: 'homeWin' | 'draw' | 'awayWin' | 'overUnder' | 'custom';
  odd: number;
  stake?: number;
  potential?: number;
  status: 'pending' | 'won' | 'lost' | 'void';
}

export interface Slip {
  id: string;
  type: 'conservative' | 'aggressive';
  bets: Bet[];
  totalOdd: number;
  totalStake?: number;
  totalPotential?: number;
  createdAt: string;
  notes?: string;
  status: 'active' | 'settled' | 'archived';
}

export interface BetMarket {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

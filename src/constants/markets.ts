// Constantes de mercados de apostas

export const BET_MARKETS = {
  WIN: { id: 'win', name: 'Resultado Final', description: '1x2' },
  OVER_UNDER: { id: 'over_under', name: 'Mais/Menos', description: 'Over/Under' },
  BOTH_SCORE: { id: 'both_score', name: 'Ambos Marcam', description: 'Sim/Não' },
  DRAW_NO_BET: { id: 'draw_no_bet', name: 'Empate Anula', description: 'DNB' },
  CORRECT_SCORE: { id: 'correct_score', name: 'Placar Exato', description: 'CS' },
  FIRST_GOAL: { id: 'first_goal', name: 'Primeiro Gol', description: 'FG' },
  LAST_GOAL: { id: 'last_goal', name: 'Último Gol', description: 'LG' },
} as const;

export const MIN_PROBABILITY_OPTIONS = [
  { value: 0.0, label: 'Qualquer um' },
  { value: 0.25, label: '25%+' },
  { value: 0.5, label: '50%+' },
  { value: 0.65, label: '65%+' },
  { value: 0.75, label: '75%+' },
];

export const SLIP_TYPES = {
  CONSERVATIVE: 'conservative',
  AGGRESSIVE: 'aggressive',
} as const;

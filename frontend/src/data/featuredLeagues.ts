export type FeaturedLeagueGroup = "world" | "europe" | "southAmerica" | "topFive" | "brazil";

export type FeaturedLeague = {
  id: number;
  name: string;
  country: string;
  group: FeaturedLeagueGroup[];
  priority: number;
};

export type LeagueFilterPreset = {
  id: string;
  label: string;
  description: string;
  leagueIds: number[];
};

export const featuredLeagues: FeaturedLeague[] = [
  { id: 1, name: "Copa do Mundo", country: "Mundo", group: ["world"], priority: 1 },
  { id: 4, name: "Eurocopa", country: "Europa", group: ["world", "europe"], priority: 2 },
  { id: 9, name: "Copa America", country: "America do Sul", group: ["world", "southAmerica"], priority: 3 },
  { id: 2, name: "Champions League", country: "Europa", group: ["europe"], priority: 4 },
  { id: 3, name: "Europa League", country: "Europa", group: ["europe"], priority: 5 },
  { id: 13, name: "Libertadores", country: "America do Sul", group: ["southAmerica"], priority: 6 },
  { id: 39, name: "Premier League", country: "Inglaterra", group: ["topFive"], priority: 7 },
  { id: 140, name: "LaLiga", country: "Espanha", group: ["topFive"], priority: 8 },
  { id: 135, name: "Serie A", country: "Italia", group: ["topFive"], priority: 9 },
  { id: 78, name: "Bundesliga", country: "Alemanha", group: ["topFive"], priority: 10 },
  { id: 61, name: "Ligue 1", country: "França", group: ["topFive"], priority: 11 },
  { id: 71, name: "Brasileirão Série A", country: "Brasil", group: ["brazil", "southAmerica"], priority: 12 },
  { id: 72, name: "Brasileirão Série B", country: "Brasil", group: ["brazil", "southAmerica"], priority: 13 }
];

export const featuredLeagueIds = featuredLeagues.map((league) => league.id);

export const leagueFilterPresets: LeagueFilterPreset[] = [
  {
    id: "featured",
    label: "Principais",
    description: "Copa do Mundo, torneios continentais e grandes ligas.",
    leagueIds: featuredLeagueIds
  },
  {
    id: "world",
    label: "Seleções",
    description: "Copa do Mundo, Eurocopa e Copa América.",
    leagueIds: featuredLeagues.filter((league) => league.group.includes("world")).map((league) => league.id)
  },
  {
    id: "top-five",
    label: "Top 5 Europa",
    description: "Premier League, LaLiga, Série A, Bundesliga e Ligue 1.",
    leagueIds: featuredLeagues.filter((league) => league.group.includes("topFive")).map((league) => league.id)
  },
  {
    id: "europe",
    label: "Europa elite",
    description: "Champions League, Liga Europa e Eurocopa.",
    leagueIds: featuredLeagues.filter((league) => league.group.includes("europe")).map((league) => league.id)
  },
  {
    id: "south-america",
    label: "América do Sul",
    description: "Libertadores, Copa América e Brasileirão Série A.",
    leagueIds: featuredLeagues.filter((league) => league.group.includes("southAmerica")).map((league) => league.id)
  },
  {
    id: "world-cup",
    label: "Copa do Mundo",
    description: "Somente partidas da Copa do Mundo.",
    leagueIds: [1]
  },
  {
    id: "brazil",
    label: "Brasileirão",
    description: "Séries A e B do Brasil.",
    leagueIds: [71, 72]
  }
];

export function getFeaturedLeagueName(leagueId?: number) {
  return featuredLeagues.find((league) => league.id === leagueId)?.name;
}

export function sortFeaturedMatches<T extends { leagueId?: number; startsAt: string }>(matches: T[]) {
  return [...matches].sort((a, b) => {
    const aPriority = featuredLeagues.find((league) => league.id === a.leagueId)?.priority ?? 999;
    const bPriority = featuredLeagues.find((league) => league.id === b.leagueId)?.priority ?? 999;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });
}

import { PerformanceShell, stitch, TeamCrest } from "@/components/PerformanceShell";
import { getBetvisionAiMatchAnalysis } from "@/services/betvisionAiRepository";
import { MarketProbability, Match } from "@/types/domain";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, BarChart3, ShieldCheck } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

function resultMarket(match: Match | null, side: "home" | "neutral" | "away") {
  return match?.markets.find((market) => market.category === "result" && market.side === side);
}

function marketGroups(markets: MarketProbability[]) {
  const labels: Record<string, string> = {
    goals: "Gols",
    doubleChance: "Dupla chance",
    corners: "Escanteios",
    cards: "Cartões",
    shots: "Chutes",
    shotsOnTarget: "Chutes no alvo",
    fouls: "Faltas",
    handicap: "Handicap"
  };
  const groups = new Map<string, MarketProbability[]>();
  markets.filter((market) => market.category !== "result").forEach((market) => {
    groups.set(market.category, [...(groups.get(market.category) ?? []), market]);
  });
  return [...groups.entries()].map(([key, rows]) => ({ key, label: labels[key] ?? key, rows: rows.slice(0, 4) }));
}

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();
  const desktop = width >= 760;

  useEffect(() => {
    const fixtureId = Number(id);
    if (!fixtureId) return;
    getBetvisionAiMatchAnalysis(fixtureId).then(setMatch).catch(() => setError("Análise indisponível para esta partida."));
  }, [id]);

  const groups = useMemo(() => marketGroups(match?.markets ?? []), [match]);
  const confidence = match?.realStats?.find((item) => item.label === "Confiança")?.value;
  const detailedSource = match?.realStats?.find((item) => item.label === "Fonte detalhada")?.value;
  const detailedMatches = match?.realStats?.find((item) => item.label === "Jogos detalhados")?.value;
  const home = resultMarket(match, "home");
  const draw = resultMarket(match, "neutral");
  const away = resultMarket(match, "away");

  return (
    <PerformanceShell>
      <View style={styles.page}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <ArrowLeft color={stitch.green} size={18} />
          <Text style={styles.backText}>VOLTAR AOS JOGOS</Text>
        </Pressable>

        {!match ? (
          <View style={styles.loading}><Text style={styles.loadingText}>{error || "Carregando análise da IA..."}</Text></View>
        ) : (
          <>
            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <Text style={styles.competition}>{match.competition} · {match.round}</Text>
                <View style={styles.qualityBadge}><Text style={styles.qualityText}>CONFIANÇA {String(confidence ?? "BAIXA").toUpperCase()}</Text></View>
              </View>
              <View style={styles.teams}>
                <View style={styles.team}><TeamCrest logo={match.homeTeam.flag} name={match.homeTeam.name} size={58} /><Text style={styles.teamName}>{match.homeTeam.name}</Text></View>
                <View style={styles.score}><Text style={styles.scoreText}>{match.projectedScore.home} : {match.projectedScore.away}</Text><Text style={styles.scoreLabel}>PLACAR PROJETADO</Text></View>
                <View style={styles.team}><TeamCrest logo={match.awayTeam.flag} name={match.awayTeam.name} size={58} /><Text style={styles.teamName}>{match.awayTeam.name}</Text></View>
              </View>
              <View style={styles.probabilities}>
                {[["CASA", home], ["EMPATE", draw], ["FORA", away]].map(([label, market]) => {
                  const item = market as MarketProbability | undefined;
                  return <View key={label as string} style={styles.probability}><Text style={styles.probabilityValue}>{item?.probability ?? 0}%</Text><Text style={styles.probabilityLabel}>{label as string}</Text></View>;
                })}
              </View>
              <Text style={styles.sourceLine}>Análise individual · {String(detailedMatches ?? 0)} jogos detalhados · {String(detailedSource ?? "dados históricos")}</Text>
            </View>

            <View style={[styles.dashboard, desktop && styles.dashboardDesktop]}>
              <View style={styles.column}>
                <View style={styles.sectionHeader}><ShieldCheck color={stitch.green} size={18} /><Text style={styles.sectionTitle}>MERCADOS DA IA</Text></View>
                {groups.map((group) => (
                  <View key={group.key} style={styles.marketCard}>
                    <Text style={styles.marketTitle}>{group.label}</Text>
                    {group.rows.map((market) => (
                      <View key={market.id} style={styles.marketRow}>
                        <Text style={styles.marketLabel}>{market.label}</Text>
                        <Text style={styles.marketValue}>{market.probability}%</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>

              <View style={styles.column}>
                <View style={styles.sectionHeader}><BarChart3 color={stitch.green} size={18} /><Text style={styles.sectionTitle}>PROJEÇÕES</Text></View>
                <View style={styles.statsCard}>
                  {[
                    ["Chutes", match.projections.shots.home, match.projections.shots.away],
                    ["No alvo", match.projections.shotsOnTarget.home, match.projections.shotsOnTarget.away],
                    ["Escanteios", match.projections.corners.home, match.projections.corners.away],
                    ["Faltas", match.projections.fouls.home, match.projections.fouls.away]
                  ].map(([label, homeValue, awayValue]) => (
                    <View key={label} style={styles.statRow}>
                      <Text style={styles.statValue}>{homeValue}</Text>
                      <Text style={styles.statLabel}>{label}</Text>
                      <Text style={styles.statValue}>{awayValue}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.disclaimer}>
                  <Text style={styles.disclaimerTitle}>BETVISION AI</Text>
                  <Text style={styles.disclaimerText}>Probabilidades estatísticas para análise. Não representam garantia de resultado.</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </PerformanceShell>
  );
}

const styles = StyleSheet.create({
  page: { alignSelf: "center", maxWidth: 980, padding: 10, paddingTop: 20, width: "100%" },
  back: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 16 },
  backText: { color: stitch.green, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  loading: { backgroundColor: stitch.panel, borderRadius: 6, padding: 40 },
  loadingText: { color: stitch.pale, textAlign: "center" },
  hero: { backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 8, borderWidth: 1, padding: 18 },
  competition: { color: stitch.green, fontSize: 10, fontWeight: "900", letterSpacing: 1, textAlign: "center", textTransform: "uppercase" },
  heroTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  qualityBadge: { backgroundColor: "#1d3824", borderColor: "#32663d", borderRadius: 3, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5 },
  qualityText: { color: stitch.green, fontSize: 7, fontWeight: "900" },
  teams: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  team: { alignItems: "center", flex: 1, gap: 8 },
  teamName: { color: stitch.text, fontSize: 15, fontWeight: "900", textAlign: "center" },
  score: { alignItems: "center", paddingHorizontal: 12 },
  scoreText: { color: stitch.text, fontSize: 28, fontWeight: "900" },
  scoreLabel: { color: stitch.muted, fontSize: 7, fontWeight: "900" },
  probabilities: { flexDirection: "row", gap: 8, marginTop: 24 },
  probability: { alignItems: "center", backgroundColor: stitch.panel2, borderRadius: 5, flex: 1, padding: 11 },
  probabilityValue: { color: stitch.green, fontSize: 19, fontWeight: "900" },
  probabilityLabel: { color: stitch.muted, fontSize: 8, fontWeight: "900", marginTop: 2 },
  sourceLine: { color: stitch.muted, fontSize: 8, fontWeight: "800", marginTop: 12, textAlign: "center" },
  dashboard: { gap: 18, marginTop: 20 },
  dashboardDesktop: { alignItems: "flex-start", flexDirection: "row" },
  column: { flex: 1, gap: 10, width: "100%" },
  sectionHeader: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 2 },
  sectionTitle: { color: stitch.green, fontSize: 14, fontWeight: "900" },
  marketCard: { backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 6, borderWidth: 1, padding: 12 },
  marketTitle: { color: stitch.text, fontSize: 12, fontWeight: "900", marginBottom: 8 },
  marketRow: { alignItems: "center", borderTopColor: stitch.line, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 38 },
  marketLabel: { color: stitch.pale, flex: 1, fontSize: 11, fontWeight: "700" },
  marketValue: { color: stitch.green, fontSize: 12, fontWeight: "900" },
  statsCard: { backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 6, borderWidth: 1, padding: 12 },
  statRow: { alignItems: "center", borderBottomColor: stitch.line, borderBottomWidth: 1, flexDirection: "row", minHeight: 52 },
  statValue: { color: stitch.text, flex: 1, fontSize: 16, fontWeight: "900", textAlign: "center" },
  statLabel: { color: stitch.muted, flex: 1.2, fontSize: 10, fontWeight: "900", textAlign: "center", textTransform: "uppercase" },
  disclaimer: { backgroundColor: "#122018", borderColor: "#254a31", borderRadius: 6, borderWidth: 1, padding: 16 },
  disclaimerTitle: { color: stitch.green, fontSize: 11, fontWeight: "900" },
  disclaimerText: { color: stitch.pale, fontSize: 10, lineHeight: 15, marginTop: 5 }
});

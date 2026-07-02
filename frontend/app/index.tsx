import { backendConfig } from "@/config/backend";
import { PerformanceShell, stitch, TeamCrest } from "@/components/PerformanceShell";
import { getBetvisionAiFixturesByDate } from "@/services/betvisionAiRepository";
import { Match } from "@/types/domain";
import { BarChart3, ChevronRight, RefreshCw, Search, ShieldCheck } from "lucide-react-native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

function dateToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Fortaleza" }).format(new Date());
}

function shortName(name: string) {
  const words = name.split(" ");
  return words.length > 2 ? `${words[0]} ${words.at(-1)}` : name;
}

function shiftDate(base: string, days: number) {
  const date = new Date(`${base}T12:00:00`);
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Fortaleza" }).format(date);
}

function strongestResult(match: Match) {
  return match.markets
    .filter((market) => market.category === "result")
    .sort((a, b) => b.probability - a.probability)[0];
}

export default function HomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const today = useMemo(dateToday, []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const desktop = width >= 760;

  useEffect(() => {
    if (backendConfig.betvisionAi.configured) {
      setLoading(true);
      getBetvisionAiFixturesByDate(selectedDate)
        .then(setMatches)
        .catch(() => setMatches([]))
        .finally(() => setLoading(false));
    }
  }, [selectedDate]);

  const filteredMatches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return matches;
    return matches.filter((match) =>
      [match.homeTeam.name, match.awayTeam.name, match.competition].join(" ").toLowerCase().includes(normalized)
    );
  }, [matches, query]);

  const groups = useMemo(() => {
    const grouped = new Map<string, Match[]>();
    filteredMatches.forEach((match) => grouped.set(match.competition, [...(grouped.get(match.competition) ?? []), match]));
    return [...grouped.entries()];
  }, [filteredMatches]);

  const dateTabs = [
    { label: "Ontem", value: shiftDate(today, -1) },
    { label: "Hoje", value: today },
    { label: "Amanhã", value: shiftDate(today, 1) }
  ];

  return (
    <PerformanceShell actions>
      <View style={styles.liveTitleRow}>
        <View style={styles.sectionTitleWithDot}>
          <ShieldCheck color={stitch.green} size={18} />
          <Text style={styles.sectionTitle}>RADAR DA RODADA</Text>
        </View>
        {desktop ? <Text style={styles.seeAll}>ANÁLISE BETVISION AI</Text> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.liveRail}>
        {matches.slice(0, 4).map((match) => {
          const strongest = strongestResult(match);
          return (
            <Pressable
              key={`radar-${match.id}`}
              onPress={() => match.apiFixtureId && router.push({ pathname: "/match/[id]", params: { id: String(match.apiFixtureId) } })}
              style={[styles.liveCard, desktop && styles.liveCardDesktop]}
            >
              <View style={styles.liveMeta}>
                <Text style={styles.minute}>{new Date(match.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Text>
                <Text style={styles.league}>{match.competition.toUpperCase()}</Text>
              </View>
              <View style={styles.liveTeam}><TeamCrest logo={match.homeTeam.flag} name={match.homeTeam.name} size={32} /><Text style={styles.liveName}>{shortName(match.homeTeam.name)}</Text><Text style={styles.liveScore}>{match.projectedScore.home}</Text></View>
              <View style={styles.liveTeam}><TeamCrest logo={match.awayTeam.flag} name={match.awayTeam.name} size={32} /><Text style={styles.liveName}>{shortName(match.awayTeam.name)}</Text><Text style={styles.liveScoreAway}>{match.projectedScore.away}</Text></View>
              <View style={styles.xg}><Text numberOfLines={1} style={styles.xgText}>{strongest ? `${strongest.label}: ${strongest.probability}%` : "Análise em processamento"}</Text><BarChart3 color={stitch.pale} size={20} /></View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.controls, desktop && styles.controlsDesktop]}>
        <View style={styles.dateTabs}>
          {dateTabs.map((tab) => (
            <Pressable key={tab.value} onPress={() => setSelectedDate(tab.value)} style={[styles.dateTab, selectedDate === tab.value && styles.dateTabActive]}>
              <Text style={[styles.dateLabel, selectedDate === tab.value && styles.dateLabelActive]}>{tab.label}</Text>
              <Text style={styles.dateValue}>{tab.value.slice(5)}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.searchBox}>
          <Search color={stitch.muted} size={17} />
          <TextInput
            onChangeText={setQuery}
            placeholder="Buscar seleção ou competição"
            placeholderTextColor={stitch.muted}
            style={styles.searchInput}
            value={query}
          />
          <RefreshCw color={stitch.green} size={17} />
        </View>
      </View>

      <View style={styles.modelBanner}>
        <View style={styles.modelIcon}><ShieldCheck color={stitch.green} size={20} /></View>
        <View style={styles.modelText}>
          <Text style={styles.modelTitle}>ANÁLISE INDIVIDUAL BETVISION AI</Text>
          <Text style={styles.modelCaption}>Forma e força específicas de cada seleção · 128 jogos detalhados · StatsBomb Open Data</Text>
        </View>
        {desktop ? <View style={styles.confidenceBadge}><Text style={styles.confidenceText}>CONFIANÇA MODERADA</Text></View> : null}
      </View>

      <View style={styles.gamesTitleRow}>
        <Text style={styles.sectionTitle}>{selectedDate === today ? "JOGOS DE HOJE" : `JOGOS DE ${selectedDate.slice(8)}/${selectedDate.slice(5, 7)}`}</Text>
        <Text style={styles.gameCount}>{filteredMatches.length} PARTIDAS</Text>
      </View>
      {groups.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>{loading ? "Carregando partidas..." : "Nenhuma partida encontrada para esta data."}</Text></View>
      ) : groups.map(([competition, rows]) => (
        <View key={competition} style={styles.competition}>
          <View style={styles.competitionBar}><Text style={styles.competitionMark}>◉</Text><Text style={styles.competitionName}>{competition}</Text></View>
          <View style={styles.fixtureCard}>
            {rows.map((match, index) => (
              <Pressable
                key={match.id}
                onPress={() => match.apiFixtureId && router.push({ pathname: "/match/[id]", params: { id: String(match.apiFixtureId) } })}
                style={({ pressed }) => [styles.fixture, index > 0 && styles.fixtureBorder, pressed && styles.fixturePressed]}
              >
                <Text style={styles.fixtureTime}>{new Date(match.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Text>
                <View style={styles.teamHomeSlot}>
                  <Text numberOfLines={1} style={styles.teamHome}>{shortName(match.homeTeam.name)}</Text>
                  <TeamCrest logo={match.homeTeam.flag} name={match.homeTeam.name} size={30} />
                </View>
                <Text style={styles.versus}>VS</Text>
                <View style={styles.teamAwaySlot}>
                  <TeamCrest logo={match.awayTeam.flag} name={match.awayTeam.name} size={30} />
                  <Text numberOfLines={1} style={styles.teamAway}>{shortName(match.awayTeam.name)}</Text>
                </View>
                {desktop ? (
                  <View style={styles.fixtureInsight}>
                    <Text style={styles.fixtureScore}>{match.projectedScore.home}:{match.projectedScore.away}</Text>
                    <Text style={styles.fixtureAi}>PROJEÇÃO IA</Text>
                  </View>
                ) : null}
                <ChevronRight color={stitch.muted} size={16} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </PerformanceShell>
  );
}

const styles = StyleSheet.create({
  liveTitleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: 20, paddingBottom: 12 },
  sectionTitleWithDot: { alignItems: "center", flexDirection: "row", gap: 7 },
  sectionTitle: { color: stitch.green, fontSize: 20, fontWeight: "900", letterSpacing: 0.3 },
  seeAll: { color: stitch.green, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  liveRail: { gap: 14, paddingHorizontal: 8 },
  liveCard: { backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 6, borderWidth: 1, padding: 16, width: 270 },
  liveCardDesktop: { width: 356 },
  liveMeta: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  minute: { backgroundColor: stitch.panel2, color: stitch.cyan, fontSize: 12, fontWeight: "900", padding: 6 },
  league: { color: stitch.pale, fontSize: 10, fontWeight: "900" },
  liveTeam: { alignItems: "center", flexDirection: "row", marginBottom: 12 },
  liveName: { color: stitch.text, flex: 1, fontSize: 18, fontWeight: "900", marginLeft: 14 },
  liveScore: { color: stitch.green, fontSize: 28, fontWeight: "900" },
  liveScoreAway: { color: "#d7dae1", fontSize: 28, fontWeight: "900" },
  xg: { alignItems: "center", borderTopColor: stitch.line, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 5, paddingTop: 16 },
  xgText: { color: stitch.pale, fontSize: 11, fontWeight: "900" },
  controls: { gap: 10, marginTop: 34, paddingHorizontal: 6 },
  controlsDesktop: { alignItems: "center", flexDirection: "row" },
  dateTabs: { backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 6, borderWidth: 1, flex: 1, flexDirection: "row", padding: 4 },
  dateTab: { alignItems: "center", borderRadius: 4, flex: 1, paddingVertical: 8 },
  dateTabActive: { backgroundColor: stitch.green },
  dateLabel: { color: stitch.pale, fontSize: 11, fontWeight: "900" },
  dateLabelActive: { color: "#071006" },
  dateValue: { color: stitch.muted, fontSize: 8, fontWeight: "900", marginTop: 2 },
  searchBox: { alignItems: "center", backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 6, borderWidth: 1, flex: 1, flexDirection: "row", gap: 9, minHeight: 48, paddingHorizontal: 12 },
  searchInput: { color: stitch.text, flex: 1, fontSize: 12, outlineStyle: "none" as never },
  modelBanner: { alignItems: "center", backgroundColor: "#122018", borderColor: "#285234", borderRadius: 7, borderWidth: 1, flexDirection: "row", gap: 11, marginHorizontal: 6, marginTop: 12, padding: 12 },
  modelIcon: { alignItems: "center", backgroundColor: "#183021", borderRadius: 20, height: 38, justifyContent: "center", width: 38 },
  modelText: { flex: 1 },
  modelTitle: { color: stitch.green, fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  modelCaption: { color: stitch.pale, fontSize: 9, lineHeight: 13, marginTop: 3 },
  confidenceBadge: { backgroundColor: stitch.green, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 6 },
  confidenceText: { color: "#071006", fontSize: 7, fontWeight: "900" },
  gamesTitleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 14, marginTop: 30, paddingHorizontal: 6 },
  gameCount: { color: stitch.muted, fontSize: 9, fontWeight: "900" },
  competition: { marginBottom: 16, paddingHorizontal: 6 },
  competitionBar: { alignItems: "center", backgroundColor: "#202329", borderRadius: 2, flexDirection: "row", gap: 7, height: 28, paddingHorizontal: 9 },
  competitionMark: { color: stitch.cyan, fontSize: 11 },
  competitionName: { color: stitch.text, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  fixtureCard: { backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 6, borderWidth: 1, marginTop: 8, overflow: "hidden" },
  fixture: { alignItems: "center", flexDirection: "row", minHeight: 62, paddingHorizontal: 10 },
  fixturePressed: { backgroundColor: stitch.panel2 },
  fixtureBorder: { borderTopColor: stitch.line, borderTopWidth: 1 },
  fixtureTime: { color: stitch.pale, fontSize: 11, fontWeight: "900", width: 48 },
  teamHomeSlot: { alignItems: "center", flex: 1, flexDirection: "row", gap: 8, justifyContent: "flex-end", minWidth: 0 },
  teamAwaySlot: { alignItems: "center", flex: 1, flexDirection: "row", gap: 8, minWidth: 0 },
  teamHome: { color: stitch.text, flexShrink: 1, fontSize: 14, fontWeight: "800", textAlign: "right" },
  versus: { color: stitch.pale, fontSize: 11, fontWeight: "900", paddingHorizontal: 14 },
  teamAway: { color: stitch.text, flexShrink: 1, fontSize: 14, fontWeight: "800" },
  fixtureInsight: { alignItems: "center", borderLeftColor: stitch.line, borderLeftWidth: 1, marginLeft: 16, paddingHorizontal: 18 },
  fixtureScore: { color: stitch.green, fontSize: 16, fontWeight: "900" },
  fixtureAi: { color: stitch.muted, fontSize: 7, fontWeight: "900" },
  empty: { backgroundColor: stitch.panel, margin: 6, padding: 30 },
  emptyText: { color: stitch.muted, textAlign: "center" }
});

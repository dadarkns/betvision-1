import { PerformanceShell, stitch } from "@/components/PerformanceShell";
import { BarChart3, CircleDot, Flag, TrendingUp } from "lucide-react-native";
import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";

const metrics = [
  { label: "TEMPORADA 24/25", value: "18", caption: "GOLS MARCADOS", icon: CircleDot },
  { label: "TOP 3 LIGA", value: "12", caption: "ASSISTÊNCIAS", icon: CircleDot },
  { label: "—", value: "88.4%", caption: "PRECISÃO DE PASSE", icon: BarChart3 },
  { label: "● LIVE", value: "7.82", caption: "NOTA MÉDIA", icon: TrendingUp }
];

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 760;
  return (
    <PerformanceShell>
      <View style={styles.page}>
      <View style={[styles.hero, desktop && styles.heroDesktop]}>
        <Image source={require("../assets/stitch/player-portrait.png")} style={styles.portrait} />
        <View style={styles.playerInfo}>
        <View style={styles.tag}><CircleDot color={stitch.green} size={10} /><Text style={styles.tagText}>ATACANTE DE ELITE</Text></View>
        <Text style={styles.name}>VINI JÚNIOR</Text>
        <View style={styles.playerMeta}>
          <Text style={styles.club}>⚽ Real Madrid CF</Text>
          <Flag color={stitch.green} size={16} />
          <Text style={styles.country}>BRASIL</Text>
          <Text style={styles.number}>#7</Text>
        </View>
        </View>
      </View>
      <View style={styles.grid}>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <View key={metric.caption} style={[styles.metric, desktop && styles.metricDesktop]}>
              <View style={styles.metricTop}><Icon color={stitch.green} size={21} /><Text style={styles.metricLabel}>{metric.label}</Text></View>
              <Text style={[styles.metricValue, metric.value === "7.82" && styles.greenValue]}>{metric.value}</Text>
              <Text style={styles.metricCaption}>{metric.caption}</Text>
            </View>
          );
        })}
      </View>
      </View>
    </PerformanceShell>
  );
}

const styles = StyleSheet.create({
  page: { alignSelf: "center", maxWidth: 900, width: "100%" },
  hero: { alignItems: "center", backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 5, borderWidth: 1, margin: 2, marginTop: 38, padding: 14 },
  heroDesktop: { flexDirection: "row", gap: 34, justifyContent: "center", padding: 30 },
  playerInfo: { alignItems: "center" },
  portrait: { borderColor: "#285d38", borderRadius: 5, borderWidth: 2, height: 145, width: 145 },
  tag: { alignItems: "center", backgroundColor: stitch.green, borderRadius: 12, flexDirection: "row", gap: 5, marginTop: 14, paddingHorizontal: 12, paddingVertical: 4 },
  tagText: { color: "#275028", fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  name: { color: stitch.text, fontSize: 30, fontWeight: "900", letterSpacing: -1.3, marginTop: 5 },
  playerMeta: { alignItems: "center", flexDirection: "row", gap: 7 },
  club: { color: stitch.cyan, fontSize: 17, fontWeight: "900" },
  country: { color: stitch.pale, fontSize: 12, fontWeight: "900" },
  number: { color: stitch.green, fontSize: 12, fontWeight: "900" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 2, paddingTop: 30 },
  metric: { backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 5, borderWidth: 1, minHeight: 94, padding: 12, width: "47%" },
  metricDesktop: { flex: 1, width: "auto" },
  metricTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  metricLabel: { color: stitch.muted, fontSize: 8, fontWeight: "900" },
  metricValue: { color: "#d5d7de", fontSize: 24, fontWeight: "900", marginTop: 7 },
  greenValue: { color: stitch.green },
  metricCaption: { color: stitch.pale, fontSize: 9, fontWeight: "900", marginTop: 3 }
});

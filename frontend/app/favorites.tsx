import { PerformanceShell, stitch } from "@/components/PerformanceShell";
import { ChevronDown, Circle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

const table = [
  ["01", "BOT", "68", "33", "20", "8", "5", "+26"],
  ["02", "PAL", "64", "33", "19", "7", "7", "+27"],
  ["03", "FLA", "60", "33", "17", "9", "7", "+14"],
  ["04", "SAO", "58", "33", "17", "7", "9", "+13"],
  ["12", "COR", "41", "33", "10", "11", "12", "-2"],
  ["17", "CUI", "33", "33", "8", "9", "16", "-17"]
];

export default function LeaguesScreen() {
  return (
    <PerformanceShell>
      <View style={styles.page}>
        <Text style={styles.eyebrow}>CAMPEONATO</Text>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>Brasileirão Série A</Text>
          <ChevronDown color={stitch.green} size={19} />
          <View style={styles.livePill}><Circle color={stitch.green} fill={stitch.green} size={7} /><Text style={styles.livePillText}>AO VIVO</Text></View>
        </View>

        <View style={styles.cards}>
          <View style={styles.card}><Text style={styles.cardLabel}>LÍDER</Text><Text style={styles.cardValue}><Text style={styles.teamDot}>BOT </Text>68</Text></View>
          <View style={styles.card}><Text style={styles.cardLabel}>ARTILHEIRO</Text><Text style={styles.cardValueWhite}>12 <Text style={styles.cardSmall}>Gols</Text></Text></View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            {["POS", "TIME", "P", "J", "V", "E", "D", "SG"].map((label) => <Text key={label} style={[styles.headText, label === "TIME" && styles.teamCell]}>{label}</Text>)}
          </View>
          {table.map((row, rowIndex) => (
            <View key={row[1]} style={[styles.tableRow, rowIndex < 4 && styles.qualifier]}>
              {row.map((value, index) => (
                <Text key={`${value}-${index}`} style={[styles.cell, index === 1 && styles.teamCell, index === 2 && styles.points, index === 0 && styles.position]}>
                  {index === 1 ? `⚽ ${value}` : value}
                </Text>
              ))}
            </View>
          ))}
          <View style={styles.legend}>
            <Text style={styles.legendText}><Text style={styles.green}>●</Text> LIBERTADORES</Text>
            <Text style={styles.legendText}><Text style={styles.cyan}>●</Text> PRÉ-LIBERTADORES</Text>
            <Text style={styles.legendText}><Text style={styles.gray}>●</Text> SUL-AMERICANA</Text>
            <Text style={styles.legendText}><Text style={styles.red}>●</Text> REBAIXAMENTO</Text>
          </View>
        </View>
      </View>
    </PerformanceShell>
  );
}

const styles = StyleSheet.create({
  page: { alignSelf: "center", maxWidth: 900, padding: 8, paddingTop: 28, width: "100%" },
  eyebrow: { color: stitch.green, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  titleRow: { alignItems: "center", flexDirection: "row", marginBottom: 20, marginTop: 4 },
  title: { color: stitch.text, flexShrink: 1, fontSize: 19, fontWeight: "900" },
  livePill: { alignItems: "center", backgroundColor: stitch.panel2, borderRadius: 12, flexDirection: "row", gap: 5, marginLeft: "auto", paddingHorizontal: 10, paddingVertical: 6 },
  livePillText: { color: stitch.pale, fontSize: 8, fontWeight: "900" },
  cards: { flexDirection: "row", gap: 8, marginBottom: 20 },
  card: { backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 5, borderWidth: 1, flex: 1, minHeight: 70, padding: 14 },
  cardLabel: { color: stitch.muted, fontSize: 9, fontWeight: "900", marginBottom: 10 },
  cardValue: { color: stitch.green, fontSize: 19, fontWeight: "900" },
  teamDot: { color: stitch.text, fontSize: 11 },
  cardValueWhite: { color: stitch.text, fontSize: 19, fontWeight: "900" },
  cardSmall: { color: stitch.pale, fontSize: 14 },
  table: { backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 5, borderWidth: 1, overflow: "hidden" },
  tableHead: { backgroundColor: "#20242a", flexDirection: "row", paddingHorizontal: 8, paddingVertical: 14 },
  headText: { color: stitch.muted, fontSize: 8, fontWeight: "900", textAlign: "center", width: 30 },
  teamCell: { flex: 1, textAlign: "left" },
  tableRow: { alignItems: "center", borderTopColor: stitch.line, borderTopWidth: 1, flexDirection: "row", minHeight: 50, paddingHorizontal: 8 },
  qualifier: { borderLeftColor: stitch.green, borderLeftWidth: 2 },
  cell: { color: stitch.pale, fontSize: 12, fontWeight: "800", textAlign: "center", width: 30 },
  position: { color: "#aeb4be" },
  points: { color: stitch.green, fontWeight: "900" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 12 },
  legendText: { color: stitch.muted, fontSize: 7, fontWeight: "900" },
  green: { color: stitch.green }, cyan: { color: stitch.cyan }, gray: { color: "#a5a5a5" }, red: { color: stitch.red }
});

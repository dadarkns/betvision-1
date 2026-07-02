import { PerformanceShell, stitch } from "@/components/PerformanceShell";
import { Search } from "lucide-react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function SearchScreen() {
  return (
    <PerformanceShell actions>
      <View style={styles.page}>
        <Text style={styles.eyebrow}>EXPLORAR</Text>
        <Text style={styles.title}>Buscar</Text>
        <View style={styles.search}>
          <Search color={stitch.green} size={20} />
          <TextInput
            placeholder="Times, jogadores e campeonatos"
            placeholderTextColor={stitch.muted}
            style={styles.input}
          />
        </View>
        <Text style={styles.section}>EM ALTA</Text>
        {["Copa do Mundo 2026", "Vini Júnior", "Brasil", "Premier League"].map((item, index) => (
          <View key={item} style={styles.result}><Text style={styles.rank}>0{index + 1}</Text><Text style={styles.resultText}>{item}</Text></View>
        ))}
      </View>
    </PerformanceShell>
  );
}

const styles = StyleSheet.create({
  page: { alignSelf: "center", maxWidth: 800, padding: 12, paddingTop: 36, width: "100%" },
  eyebrow: { color: stitch.green, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: stitch.text, fontSize: 30, fontWeight: "900", marginBottom: 24, marginTop: 3 },
  search: { alignItems: "center", backgroundColor: stitch.panel, borderColor: stitch.line, borderRadius: 5, borderWidth: 1, flexDirection: "row", gap: 12, paddingHorizontal: 14 },
  input: { color: stitch.text, flex: 1, fontSize: 14, minHeight: 52, outlineStyle: "none" as never },
  section: { color: stitch.green, fontSize: 14, fontWeight: "900", marginBottom: 10, marginTop: 36 },
  result: { alignItems: "center", backgroundColor: stitch.panel, borderBottomColor: stitch.line, borderBottomWidth: 1, flexDirection: "row", minHeight: 58, padding: 12 },
  rank: { color: stitch.green, fontSize: 11, fontWeight: "900", width: 38 },
  resultText: { color: stitch.text, fontSize: 15, fontWeight: "800" }
});

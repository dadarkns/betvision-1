import { router, usePathname } from "expo-router";
import { Bell, Home, Menu, Search, Trophy, UserRound } from "lucide-react-native";
import { PropsWithChildren } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const stitch = {
  bg: "#0c0f12",
  header: "#111a14",
  panel: "#171b21",
  panel2: "#1c2027",
  line: "#292e36",
  green: "#5cff4a",
  pale: "#b9c8b3",
  text: "#eef0f3",
  muted: "#7d8779",
  cyan: "#62dbe8",
  red: "#dd8c91"
};

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/favorites", label: "Ligas", icon: Trophy },
  { href: "/radar", label: "Buscar", icon: Search },
  { href: "/profile", label: "Perfil", icon: UserRound }
] as const;

type Props = PropsWithChildren<{ actions?: boolean }>;

export function TeamCrest({ name, logo, size = 34 }: { name: string; logo?: string; size?: number }) {
  return (
    <View style={[styles.crest, { height: size, width: size }]}>
      {logo ? (
        <Image resizeMode="contain" source={{ uri: logo }} style={{ height: size - 8, width: size - 8 }} />
      ) : (
        <Text style={styles.crestFallback}>{name.slice(0, 1).toUpperCase()}</Text>
      )}
    </View>
  );
}

export function PerformanceShell({ children, actions = false }: Props) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const desktop = width >= 760;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.frame, desktop && styles.frameDesktop]}>
        <View style={[styles.header, desktop && styles.headerDesktop]}>
          <Pressable accessibilityLabel="Menu" style={styles.headerButton}>
            <Menu color={stitch.green} size={22} strokeWidth={2.6} />
          </Pressable>
          <Pressable onPress={() => router.push("/")} style={styles.brand}>
            <Text style={styles.brandText}>BETVISION</Text>
            <Text style={styles.brandSub}>PERFORMANCE PRO</Text>
          </Pressable>
          {desktop ? (
            <View style={styles.desktopNav}>
              {items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Pressable key={item.href} onPress={() => router.push(item.href)} style={[styles.desktopNavItem, active && styles.desktopNavActive]}>
                    <Icon color={active ? stitch.green : stitch.pale} size={17} />
                    <Text style={[styles.desktopNavText, active && styles.desktopNavTextActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          <View style={styles.headerActions}>
            {actions ? <Search color={stitch.pale} size={20} strokeWidth={2.6} /> : null}
            <Bell color={stitch.pale} size={20} strokeWidth={2.4} />
            <View style={styles.notificationDot} />
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.content, desktop && styles.contentDesktop]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>

        {!desktop ? <View style={styles.dock}>
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Pressable key={item.href} onPress={() => router.push(item.href)} style={styles.dockItem}>
                <Icon color={active ? stitch.green : stitch.muted} size={21} strokeWidth={2.5} />
                <Text style={[styles.dockText, active && styles.dockTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: stitch.bg, flex: 1 },
  frame: {
    alignSelf: "center",
    backgroundColor: stitch.bg,
    flex: 1,
    maxWidth: 430,
    width: "100%"
  },
  frameDesktop: { maxWidth: 1180 },
  header: {
    alignItems: "center",
    backgroundColor: stitch.header,
    borderBottomColor: "#1b2420",
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 58,
    paddingHorizontal: 10
  },
  headerDesktop: { borderRadius: 8, height: 68, marginTop: 12, paddingHorizontal: 18 },
  headerButton: { alignItems: "center", justifyContent: "center", width: 34 },
  brand: { paddingLeft: 8 },
  brandText: {
    color: stitch.green,
    fontSize: 17,
    fontStyle: "italic",
    fontWeight: "900",
    letterSpacing: -0.5
  },
  brandSub: { color: stitch.muted, fontSize: 7, fontWeight: "900", letterSpacing: 1.2, marginTop: -1 },
  desktopNav: { flex: 1, flexDirection: "row", gap: 5, justifyContent: "center" },
  desktopNavItem: { alignItems: "center", borderRadius: 5, flexDirection: "row", gap: 7, paddingHorizontal: 14, paddingVertical: 10 },
  desktopNavActive: { backgroundColor: stitch.panel2 },
  desktopNavText: { color: stitch.pale, fontSize: 12, fontWeight: "800" },
  desktopNavTextActive: { color: stitch.green },
  headerActions: { alignItems: "center", flexDirection: "row", gap: 20, paddingRight: 5 },
  notificationDot: {
    backgroundColor: stitch.green,
    borderRadius: 5,
    height: 5,
    position: "absolute",
    right: 3,
    top: 1,
    width: 5
  },
  content: { flexGrow: 1, paddingBottom: 92 },
  contentDesktop: { paddingBottom: 30, paddingHorizontal: 20 },
  dock: {
    backgroundColor: "#101317",
    borderTopColor: stitch.line,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    height: 76,
    left: 0,
    position: "absolute",
    right: 0
  },
  dockItem: { alignItems: "center", flex: 1, gap: 4, justifyContent: "center" },
  dockText: { color: stitch.muted, fontSize: 10, fontWeight: "800" },
  dockTextActive: { color: stitch.green },
  crest: { alignItems: "center", backgroundColor: "#0b1013", borderColor: stitch.line, borderRadius: 999, borderWidth: 1, justifyContent: "center", overflow: "hidden" },
  crestFallback: { color: stitch.green, fontSize: 11, fontWeight: "900" }
});

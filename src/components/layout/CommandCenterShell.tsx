import React, { useState, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Bell, Menu, Search, X } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';

const LOGO = require('../../assets/logo.png');

export type ShellNavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

type CommandCenterShellProps = {
  brand?: string;
  tagline?: string;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  activeNavKey?: string;
  navItems?: ShellNavItem[];
  onNavigate?: (key: string) => void;
  rightAccessory?: React.ReactNode;
  children: React.ReactNode;
};

export function CommandCenterShell({
  brand = 'BETVISION',
  tagline = 'Análise esportiva',
  title,
  subtitle,
  searchPlaceholder = 'Buscar times, jogadores ou rumores...',
  activeNavKey,
  navItems = [],
  onNavigate,
  rightAccessory,
  children,
}: CommandCenterShellProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  // Sidebar toggle (desktop only)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarAnim = useRef(new Animated.Value(1)).current;

  const toggleSidebar = () => {
    const toValue = sidebarOpen ? 0 : 1;
    Animated.timing(sidebarAnim, {
      toValue,
      duration: 220,
      useNativeDriver: false,
    }).start();
    setSidebarOpen(!sidebarOpen);
  };

  const sidebarWidth = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 236],
  });

  const sidebarOpacity = sidebarAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.root}>
      <View style={styles.backgroundGlowLeft} />
      <View style={styles.backgroundGlowRight} />

      <View style={styles.shell}>
        {/* ── Sidebar (desktop only, colapsável) ── */}
        {isDesktop ? (
          <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
            <Animated.View style={[styles.sidebarInner, { opacity: sidebarOpacity }]}>
              <View style={styles.brandBlock}>
                <Image
                  source={LOGO}
                  style={styles.sidebarLogo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.navGroup}>
                {navItems.map(item => (
                  <Pressable
                    key={item.key}
                    onPress={() => onNavigate?.(item.key)}
                    style={({ pressed }) => [
                      styles.navItem,
                      activeNavKey === item.key && styles.navItemActive,
                      pressed && styles.navItemPressed,
                    ]}
                  >
                    <View style={styles.navIcon}>{item.icon}</View>
                    <Text style={[styles.navLabel, activeNavKey === item.key && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.sidebarFooter}>
                <View style={styles.upgradeCard}>
                  <Text style={styles.upgradeLabel}>ACESSO PRO</Text>
                  <Text style={styles.upgradeText}>Desbloqueie modelos preditivos, scouting avançado e dados via API.</Text>
                  <Pressable style={styles.upgradePill}>
                    <View style={styles.upgradeDot} />
                    <Text style={styles.upgradePillText}>ASSINAR PRO</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        ) : null}

        {/* ── Área principal ── */}
        <View style={styles.main}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              {/* Botão de toggle da sidebar (desktop) ou brand (mobile) */}
              {isDesktop ? (
                <Pressable onPress={toggleSidebar} style={styles.menuButton} id="sidebar-toggle-btn">
                  {sidebarOpen
                    ? <X size={18} color={colors.onSurfaceVariant} strokeWidth={2} />
                    : <Menu size={18} color={colors.onSurfaceVariant} strokeWidth={2} />
                  }
                </Pressable>
              ) : (
                <Image
                  source={LOGO}
                  style={styles.mobileLogo}
                  resizeMode="contain"
                />
              )}
              {title ? <Text style={styles.pageTitle}>{title}</Text> : null}
              {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
            </View>

            <View style={styles.topBarRight}>
              {rightAccessory}
              <View style={styles.iconPill}><Search size={15} color={colors.onSurfaceVariant} strokeWidth={2.2} /></View>
              <View style={styles.iconPill}><Bell size={15} color={colors.onSurfaceVariant} strokeWidth={2.2} /></View>
              <View style={styles.profileChip}>
                <View style={styles.profileAvatar} />
              </View>
            </View>
          </View>

          {/* Barra de busca */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search size={16} color={colors.onSurfaceVariant} strokeWidth={2.2} />
              <TextInput
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.onSurfaceVariant}
                style={styles.searchInput}
              />
            </View>
          </View>

          {/* Conteúdo */}
          <View style={styles.contentWrap}>
            <ScrollView
              style={styles.contentScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContent}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* ── Bottom bar (mobile only) ── */}
      {!isDesktop ? (
        <View style={styles.bottomBar}>
          {navItems.slice(0, 5).map(item => (
            <Pressable
              key={item.key}
              onPress={() => onNavigate?.(item.key)}
              style={styles.bottomNavItem}
            >
              <View style={[styles.bottomNavIcon, activeNavKey === item.key && styles.bottomNavIconActive]}>
                {item.icon}
              </View>
              <Text style={[styles.bottomNavLabel, activeNavKey === item.key && styles.bottomNavLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
    flexDirection: 'row',
  },
  backgroundGlowLeft: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 280,
    left: -100,
    top: -80,
    backgroundColor: 'rgba(101, 255, 75, 0.07)',
  },
  backgroundGlowRight: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 240,
    right: -90,
    top: 120,
    backgroundColor: 'rgba(120, 231, 255, 0.05)',
  },

  // ── Sidebar ──────────────────────────────────────────────────
  sidebar: {
    overflow: 'hidden',
    borderRightWidth: 1,
    borderRightColor: colors.white10,
    backgroundColor: 'rgba(10, 12, 16, 0.7)',
  },
  sidebarInner: {
    width: 236,
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  brandBlock: {
    marginBottom: spacing.xl,
  },
  sidebarLogo: {
    width: 200,
    height: 64,
    alignSelf: 'flex-start',
  },
  mobileLogo: {
    width: 110,
    height: 36,
  },
  navGroup: {
    gap: 4,
    flex: 1,
  },
  navItem: {
    minHeight: 42,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navItemPressed: {
    backgroundColor: colors.white5,
  },
  navItemActive: {
    backgroundColor: 'rgba(101, 255, 75, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryFixed,
  },
  navIcon: {
    width: 18,
    alignItems: 'center',
  },
  navLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navLabelActive: {
    color: colors.primaryFixed,
  },
  sidebarFooter: {
    marginTop: spacing.lg,
  },
  upgradeCard: {
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    gap: 10,
  },
  upgradeLabel: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  upgradeText: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
  },
  upgradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${colors.primaryFixed}55`,
    backgroundColor: 'rgba(101, 255, 75, 0.1)',
  },
  upgradePillText: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  upgradeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryFixed,
  },

  // ── Main ─────────────────────────────────────────────────────
  main: {
    flex: 1,
    minWidth: 0,
    paddingTop: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  topBarLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pageTitle: {
    ...fonts.headlineLg,
    color: colors.onSurface,
    fontSize: 20,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
  pageSubtitle: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white5,
  },
  profileChip: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white10,
    padding: 2,
  },
  profileAvatar: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: colors.primaryFixed,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 42,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    ...fonts.bodyMd,
    fontSize: 13,
    paddingVertical: 0,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionPill: {
    height: 42,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  contentWrap: {
    flex: 1,
    minHeight: 0,
  },
  contentScroll: {
    flex: 1,
  },
  contentContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 96,
    gap: spacing.md,
  },

  // ── Bottom bar (mobile) ───────────────────────────────────────
  bottomBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.white10,
    backgroundColor: colors.surfaceContainerLowest,
    paddingBottom: 8,
    paddingTop: 8,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  bottomNavIcon: {
    opacity: 0.45,
  },
  bottomNavIconActive: {
    opacity: 1,
  },
  bottomNavLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomNavLabelActive: {
    color: colors.primaryFixed,
  },
});
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Bell, Search, Shield } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';

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

function ShellChip({ label, active, onPress, icon }: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.shellChip, active && styles.shellChipActive, pressed && styles.shellChipPressed]}>
      {icon}
      <Text style={[styles.shellChipText, active && styles.shellChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

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

  return (
    <View style={styles.root}>
      <View style={styles.backgroundGlowLeft} />
      <View style={styles.backgroundGlowRight} />

      <View style={styles.shell}>
        {isDesktop ? (
          <View style={styles.sidebar}>
            <View style={styles.brandBlock}>
              <View style={styles.brandMark}>
                <Shield size={14} color={colors.primaryFixed} strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.brandText}>{brand}</Text>
                <Text style={styles.brandTagline}>{tagline}</Text>
              </View>
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
                <ShellChip
                  label="ASSINAR PRO"
                  active
                  icon={<View style={styles.upgradeDot} />}
                />
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.main}>
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Text style={styles.mobileBrand}>{brand}</Text>
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

          {navItems.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mobileNavStrip}
              style={styles.mobileNavScroll}
            >
              {navItems.map(item => (
                <ShellChip
                  key={item.key}
                  label={item.label}
                  active={activeNavKey === item.key}
                  onPress={() => onNavigate?.(item.key)}
                  icon={item.icon}
                />
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search size={16} color={colors.onSurfaceVariant} strokeWidth={2.2} />
              <TextInput
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.onSurfaceVariant}
                style={styles.searchInput}
              />
            </View>
            {isDesktop ? (
              <View style={styles.quickActions}>
                <View style={styles.quickActionPill}>
                  <Text style={styles.quickActionLabel}>SERVIDOR</Text>
                </View>
                <View style={styles.quickActionPill}>
                  <Text style={styles.quickActionLabel}>STATUS API</Text>
                </View>
              </View>
            ) : null}
          </View>

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

      {!isDesktop ? (
        <View style={styles.bottomBar}>
          {navItems.slice(0, 4).map(item => (
            <Pressable
              key={item.key}
              onPress={() => onNavigate?.(item.key)}
              style={styles.bottomNavItem}
            >
              <View style={[styles.bottomNavIcon, activeNavKey === item.key && styles.bottomNavIconActive]}>{item.icon}</View>
              <Text style={[styles.bottomNavLabel, activeNavKey === item.key && styles.bottomNavLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
          <View style={styles.bottomBarSpacer} />
          <View style={styles.bottomBarSpacer} />
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
  sidebar: {
    width: 236,
    borderRightWidth: 1,
    borderRightColor: colors.white10,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(10, 12, 16, 0.7)',
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.xl,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    ...fonts.headlineMd,
    color: colors.primaryFixed,
    fontSize: 18,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  brandTagline: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  navGroup: {
    gap: 4,
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
    marginTop: 'auto',
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
  upgradeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryFixed,
  },
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
  },
  mobileBrand: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
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
  mobileNavScroll: {
    flexGrow: 0,
  },
  mobileNavStrip: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: 8,
  },
  shellChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
  },
  shellChipPressed: {
    opacity: 0.86,
  },
  shellChipActive: {
    borderColor: `${colors.primaryFixed}55`,
    backgroundColor: 'rgba(101, 255, 75, 0.1)',
  },
  shellChipText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  shellChipTextActive: {
    color: colors.primaryFixed,
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
  },
  bottomNavIcon: {
    opacity: 0.5,
  },
  bottomNavIconActive: {
    opacity: 1,
  },
  bottomNavLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  bottomNavLabelActive: {
    color: colors.primaryFixed,
  },
  bottomBarSpacer: {
    width: 8,
  },
});
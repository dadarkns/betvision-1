import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

export function ScreenHeader({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={headerStyles.wrap}>
      <View style={headerStyles.textBlock}>
        {kicker ? <Text style={headerStyles.kicker}>{kicker}</Text> : null}
        <Text style={headerStyles.title}>{title}</Text>
        {subtitle ? <Text style={headerStyles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={headerStyles.action}>{action}</View> : null}
    </View>
  );
}

export function StatTile({ label, value, hint, accent }: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}) {
  return (
    <View style={[tileStyles.card, accent ? { borderLeftColor: accent } : null]}>
      <Text style={tileStyles.label}>{label}</Text>
      <Text style={[tileStyles.value, accent ? { color: accent } : null]}>{value}</Text>
      {hint ? <Text style={tileStyles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Pill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View style={[pillStyles.pill, active && pillStyles.active]}>
      <Text style={[pillStyles.text, active && pillStyles.textActive]}>{label}</Text>
    </View>
  );
}

export function MiniBar({ left, right, leftColor = colors.primaryFixed, rightColor = colors.white20 }: {
  left: number;
  right: number;
  leftColor?: string;
  rightColor?: string;
}) {
  const total = Math.max(left + right, 1);
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { flex: left / total, backgroundColor: leftColor }]} />
      <View style={[barStyles.fill, { flex: right / total, backgroundColor: rightColor }]} />
    </View>
  );
}

export function SectionLabel({ title, action }: { title: string; action?: string }) {
  return (
    <View style={sectionStyles.wrap}>
      <Text style={sectionStyles.title}>{title}</Text>
      {action ? <Text style={sectionStyles.action}>{action}</Text> : null}
    </View>
  );
}

export function Grid({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[gridStyles.grid, style]}>{children}</View>;
}

const headerStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  title: {
    ...fonts.headlineLg,
    color: colors.onSurface,
    textTransform: 'uppercase',
    fontSize: 24,
    lineHeight: 28,
  },
  subtitle: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  action: {
    alignItems: 'flex-end',
  },
});

const tileStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryFixed,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  label: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  value: {
    ...fonts.headlineMd,
    color: colors.onSurface,
    fontSize: 18,
  },
  hint: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
});

const pillStyles = StyleSheet.create({
  pill: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: 'rgba(119, 255, 95, 0.12)',
    borderColor: 'rgba(119, 255, 95, 0.35)',
  },
  text: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  textActive: {
    color: colors.primaryFixed,
  },
});

const barStyles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: colors.white5,
  },
  fill: {
    height: '100%',
  },
});

const sectionStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...fonts.headlineMd,
    color: colors.onSurface,
    textTransform: 'uppercase',
    fontSize: 16,
  },
  action: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 9,
    textTransform: 'uppercase',
  },
});

const gridStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
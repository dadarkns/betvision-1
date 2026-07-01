import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';

interface StatBarProps {
  label: string;
  homeValue: string | number;
  awayValue: string | number;
  homePercent: number;
  awayPercent: number;
  accentHome?: boolean;
}

export function StatBar({ label, homeValue, awayValue, homePercent, awayPercent, accentHome = true }: StatBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.value, accentHome && styles.accent]}>{homeValue}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{awayValue}</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.barSegment, styles.barHome, { flex: homePercent }]} />
        <View style={[styles.barSegment, styles.barAway, { flex: awayPercent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'center',
  },
  value: {
    ...fonts.labelMono,
    color: colors.onSurface,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  accent: {
    color: colors.primaryFixed,
  },
  barContainer: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: colors.white5,
  },
  barSegment: {
    height: '100%',
  },
  barHome: {
    backgroundColor: colors.primaryFixed,
  },
  barAway: {
    backgroundColor: colors.white20,
  },
});

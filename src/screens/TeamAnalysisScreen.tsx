import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight, Shield, Sparkles, Users } from 'lucide-react-native';
import { GlassCard } from '../components/GlassCard';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { Grid, Pill, ScreenHeader, SectionLabel, StatTile } from './shared';

const performers = [
  { name: 'Jude Bellingham', role: '8.9 avg rating', accent: colors.primaryFixed },
  { name: 'Vinicius Junior', role: '8.4 avg rating', accent: colors.secondaryContainer },
  { name: 'Toni Kroos', role: '8.1 avg rating', accent: colors.onSurfaceVariant },
];

const fixtures = [
  { competition: 'Champions League', matchup: 'RMA vs MCI', time: 'Tomorrow 21:00' },
  { competition: 'La Liga', matchup: 'RMA vs FCB', time: 'Apr 21, 19:30' },
];

export function TeamAnalysisScreen() {
  const nodeOffsets = [styles.node0, styles.node1, styles.node2, styles.node3];

  return (
    <View style={styles.page}>
      <ScreenHeader
        kicker="Team Analysis"
        title="Real Madrid"
        subtitle="Estrutura tática, volume de posse e forma recente em alta densidade."
        action={(
          <View style={styles.pillRow}>
            <Pill label="La Liga" active />
            <Pill label="Live data" />
          </View>
        )}
      />

      <GlassCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.logoCard}>
            <View style={styles.logoMark} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Elite performance profile for the 2023/24 season.</Text>
            <Text style={styles.heroDesc}>Tactical dominance established through high-press transitions and vertical depth optimization.</Text>
          </View>
          <View style={styles.gradeRing}>
            <Text style={styles.gradeValue}>8.5</Text>
            <Text style={styles.gradeLabel}>Season grade</Text>
          </View>
        </View>

        <View style={styles.heroMetrics}>
          <StatTile label="Win prob" value="78.4%" accent={colors.primaryFixed} />
          <StatTile label="xG / match" value="2.42" accent={colors.secondaryContainer} />
          <StatTile label="PPDA" value="8.1" accent={colors.onSurface} />
          <StatTile label="Pressing" value="High" accent={colors.primaryFixed} />
        </View>
      </GlassCard>

      <View style={styles.mainGrid}>
        <GlassCard style={styles.boardCard}>
          <SectionLabel title="Tactical Board" action="Attack" />
          <View style={styles.pitch}>
            <View style={styles.pitchCenter} />
            {[1, 2, 4, 5, 7, 8, 11, 12, 15, 22, 23].map((num, index) => (
              <View key={num} style={[styles.node, index < 3 ? styles.nodeActive : null, nodeOffsets[index % nodeOffsets.length]]}>
                <Text style={styles.nodeText}>{num}</Text>
              </View>
            ))}
            <View style={styles.pitchGlow} />
          </View>
          <View style={styles.pitchStats}>
            <Text style={styles.pitchStat}>Possession 59.2%</Text>
            <Text style={styles.pitchStat}>Pass accuracy 89.4%</Text>
            <Text style={styles.pitchStat}>Avg shot dist. 16.8m</Text>
            <Text style={styles.pitchStat}>Final 3rd entry 48</Text>
          </View>
        </GlassCard>

        <View style={styles.sideColumn}>
          <GlassCard style={styles.performersCard}>
            <SectionLabel title="Top performers" action="View full squad" />
            {performers.map(item => (
              <View key={item.name} style={styles.performerRow}>
                <View style={[styles.performerIcon, { borderColor: item.accent }]}><Users size={14} color={item.accent} /></View>
                <View style={styles.performerInfo}>
                  <Text style={styles.performerName}>{item.name}</Text>
                  <Text style={styles.performerRole}>{item.role}</Text>
                </View>
              </View>
            ))}
          </GlassCard>

          <GlassCard style={styles.fixturesCard}>
            <SectionLabel title="Upcoming fixtures" />
            {fixtures.map(item => (
              <View key={item.matchup} style={styles.fixtureRow}>
                <View style={styles.fixtureMeta}>
                  <Text style={styles.fixtureComp}>{item.competition}</Text>
                  <Text style={styles.fixtureTime}>{item.time}</Text>
                </View>
                <Text style={styles.fixtureMatch}>{item.matchup}</Text>
              </View>
            ))}
          </GlassCard>

          <GlassCard style={styles.insightCard} highlighted>
            <View style={styles.insightTop}>
              <Sparkles size={16} color={colors.primaryFixed} />
              <Text style={styles.insightTitle}>Tactical insight</Text>
            </View>
            <Text style={styles.insightText}>Madrid is overloading through Vini Jr and Bellingham creating a 4.2 high-value chances per match.</Text>
          </GlassCard>
        </View>
      </View>

      <Grid>
        <StatTile label="Squad depth" value="Elite" hint="4 formations" accent={colors.primaryFixed} />
        <StatTile label="Recent form" value="W W D W W" hint="last 5" accent={colors.secondaryContainer} />
        <StatTile label="Avg shot" value="16.8m" hint="distance" accent={colors.onSurface} />
        <StatTile label="Pressure" value="High" hint="ball recovery" accent={colors.primaryFixed} />
      </Grid>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  logoCard: {
    width: 116,
    height: 116,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryFixed,
    backgroundColor: 'rgba(119,255,95,0.08)',
  },
  heroCopy: {
    flex: 1,
    minWidth: 240,
    gap: 6,
  },
  heroTitle: {
    ...fonts.headlineLg,
    color: colors.onSurface,
    textTransform: 'uppercase',
    fontSize: 26,
  },
  heroDesc: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  gradeRing: {
    width: 104,
    height: 104,
    borderRadius: 999,
    borderWidth: 8,
    borderColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeValue: {
    fontSize: 28,
    color: colors.onSurface,
    fontWeight: '800',
  },
  gradeLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mainGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  boardCard: {
    flex: 1,
    minWidth: 0,
    padding: spacing.lg,
  },
  pitch: {
    aspectRatio: 1.3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  pitchCenter: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white20,
    left: '50%',
    top: '50%',
    marginLeft: -18,
    marginTop: -18,
  },
  pitchGlow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '26%',
    backgroundColor: 'rgba(119,255,95,0.08)',
  },
  node: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white20,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeActive: {
    borderColor: colors.primaryFixed,
    backgroundColor: 'rgba(119,255,95,0.12)',
  },
  nodeText: {
    ...fonts.labelMono,
    color: colors.onSurface,
    fontSize: 9,
  },
  node0: { left: 16, top: '50%', marginTop: -15 },
  node1: { left: 36, top: '35%' },
  node2: { left: 56, top: '20%' },
  node3: { left: 48, top: '65%' },
  pitchStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  pitchStat: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  sideColumn: {
    width: '100%',
    gap: spacing.md,
  },
  performersCard: {
    padding: spacing.lg,
    gap: 10,
  },
  performerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  performerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performerInfo: {
    flex: 1,
    minWidth: 0,
  },
  performerName: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  performerRole: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  fixturesCard: {
    padding: spacing.lg,
    gap: 10,
  },
  fixtureRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
    gap: 6,
  },
  fixtureMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  fixtureComp: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  fixtureTime: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
  fixtureMatch: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  insightCard: {
    padding: spacing.lg,
    gap: 10,
    backgroundColor: 'rgba(119,255,95,0.08)',
  },
  insightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightTitle: {
    ...fonts.headlineMd,
    color: colors.onSurface,
    textTransform: 'uppercase',
    fontSize: 15,
  },
  insightText: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
});

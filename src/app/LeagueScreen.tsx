import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Pressable,
} from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { colors, fonts, spacing } from '../constants/theme';
import { leagueStandings } from '../constants/data';

const ZONE_COLORS = {
  title: colors.primaryFixed,
  libertadores: `${colors.primaryFixed}80`,
  sudamericana: colors.secondaryContainer,
  mid: 'transparent',
  relegation: colors.error,
};

function StandingRow({ item, isLast }: { item: typeof leagueStandings[0]; isLast: boolean }) {
  const [pressed, setPressed] = useState(false);
  const zoneColor = ZONE_COLORS[item.zone];
  const isRelegation = item.zone === 'relegation';
  const isTitle = item.zone === 'title';

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={[
        styles.row,
        pressed && styles.rowPressed,
        isRelegation && styles.rowRelegation,
        !isLast && styles.rowBorder,
      ]}>
        {/* Position with colored zone bar */}
        <View style={styles.posCell}>
          {zoneColor !== 'transparent' && (
            <View style={[styles.zoneBar, { backgroundColor: zoneColor }]} />
          )}
          <Text style={[styles.pos, isTitle && styles.posTitle, isRelegation && styles.posRelegation]}>
            {String(item.pos).padStart(2, '0')}
          </Text>
        </View>

        {/* Team */}
        <View style={styles.teamCell}>
          <View style={styles.teamLogo} />
          <Text style={styles.teamName} numberOfLines={1}>{item.team}</Text>
        </View>

        {/* Stats */}
        <Text style={[styles.pts, isTitle && styles.ptsTitle, isRelegation && styles.ptsRelegation]}>
          {item.pts}
        </Text>
        <Text style={styles.stat}>{item.played}</Text>
        <Text style={styles.stat}>{item.won}</Text>
        <Text style={styles.stat}>{item.drawn}</Text>
        <Text style={styles.stat}>{item.lost}</Text>
        <Text style={[styles.gd, item.gd > 0 ? styles.gdPositive : item.gd < 0 ? styles.gdNegative : styles.stat]}>
          {item.gd > 0 ? `+${item.gd}` : item.gd}
        </Text>
      </View>
    </Pressable>
  );
}

export function LeagueScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surfaceContainerLowest} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SEASON 2024</Text>
          </View>
          <Text style={styles.title}>BRASILEIRÃO{'\n'}SÉRIE A</Text>
        </View>
        <View style={styles.roundBadge}>
          <Text style={styles.roundLabel}>RODADA</Text>
          <Text style={styles.roundNum}>32</Text>
          <Text style={styles.roundSub}>de 38</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.tableCard}>
          {/* Table Header */}
          <View style={[styles.row, styles.tableHeader]}>
            <View style={styles.posCell}>
              <Text style={styles.colHead}>#</Text>
            </View>
            <View style={styles.teamCell}>
              <Text style={styles.colHead}>TIME</Text>
            </View>
            <Text style={styles.colHead}>P</Text>
            <Text style={styles.colHead}>J</Text>
            <Text style={styles.colHead}>V</Text>
            <Text style={styles.colHead}>E</Text>
            <Text style={styles.colHead}>D</Text>
            <Text style={styles.colHead}>SG</Text>
          </View>

          {leagueStandings.map((item, index) => (
            <StandingRow
              key={item.pos}
              item={item}
              isLast={index === leagueStandings.length - 1}
            />
          ))}
        </GlassCard>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: colors.primaryFixed, label: 'Libertadores (G4)' },
            { color: `${colors.primaryFixed}80`, label: 'Pré-Libertadores' },
            { color: colors.secondaryContainer, label: 'Sulamericana' },
            { color: colors.error, label: 'Rebaixamento' },
          ].map(({ color, label }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Leader Card */}
        <GlassCard style={[styles.leaderCard, { marginBottom: spacing.xl + 20 }]}>
          <View style={styles.leaderHeader}>
            <Text style={styles.leaderLabel}>🏆 LÍDER DA TEMPORADA</Text>
          </View>
          <View style={styles.leaderContent}>
            <View style={styles.leaderLogoLg} />
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderName}>BOTAFOGO</Text>
              <Text style={styles.leaderSub}>72.0% de aproveitamento</Text>
              <View style={styles.formRow}>
                {['V','V','E','V','V'].map((r, i) => (
                  <View key={i} style={[styles.formDot, r === 'V' ? styles.formWin : r === 'E' ? styles.formDraw : styles.formLoss]}>
                    <Text style={styles.formText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.leaderPts}>
              <Text style={styles.leaderPtsNum}>67</Text>
              <Text style={styles.leaderPtsLabel}>PTS</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  badge: {
    backgroundColor: `${colors.primaryFixed}1A`,
    borderWidth: 1,
    borderColor: `${colors.primaryFixed}40`,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    ...fonts.headlineLg,
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  roundBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.white10,
    minWidth: 60,
  },
  roundLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  roundNum: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryFixed,
    fontFamily: 'System',
    lineHeight: 30,
  },
  roundSub: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
  tableCard: {
    margin: spacing.marginMobile,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: `${colors.surfaceContainerHigh}80`,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowPressed: {
    backgroundColor: colors.white5,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
  },
  rowRelegation: {
    backgroundColor: `${colors.errorContainer}0D`,
  },
  posCell: {
    width: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
  },
  zoneBar: {
    width: 3,
    height: 24,
    borderRadius: 2,
  },
  pos: {
    ...fonts.labelMono,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 11,
  },
  posTitle: {
    color: colors.primaryFixed,
  },
  posRelegation: {
    color: colors.error,
  },
  teamCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  teamLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white10,
  },
  teamName: {
    ...fonts.dataTable,
    color: colors.onSurface,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    flex: 1,
    fontSize: 12,
  },
  pts: {
    ...fonts.labelMono,
    color: colors.onSurface,
    fontWeight: '700',
    width: 30,
    textAlign: 'center',
    fontSize: 12,
  },
  ptsTitle: {
    color: colors.primaryFixed,
  },
  ptsRelegation: {
    color: colors.error,
  },
  stat: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    width: 24,
    textAlign: 'center',
    fontSize: 11,
  },
  gd: {
    ...fonts.labelMono,
    width: 30,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 11,
  },
  gdPositive: {
    color: colors.secondaryContainer,
  },
  gdNegative: {
    color: colors.error,
  },
  colHead: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: 'uppercase',
    textAlign: 'center',
    width: 30,
    fontWeight: '600',
  },
  legend: {
    paddingHorizontal: spacing.marginMobile,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  leaderCard: {
    marginHorizontal: spacing.marginMobile,
    overflow: 'hidden',
  },
  leaderHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
    backgroundColor: `${colors.primaryFixed}0A`,
  },
  leaderLabel: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  leaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  leaderLogoLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: `${colors.primaryFixed}60`,
  },
  leaderInfo: {
    flex: 1,
    gap: 4,
  },
  leaderName: {
    ...fonts.headlineMd,
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  leaderSub: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  formDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formWin: { backgroundColor: colors.primaryFixed },
  formDraw: { backgroundColor: colors.onSurfaceVariant },
  formLoss: { backgroundColor: colors.error },
  formText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onPrimaryFixed,
    fontFamily: 'Courier',
  },
  leaderPts: {
    alignItems: 'center',
    backgroundColor: `${colors.primaryFixed}1A`,
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.primaryFixed}30`,
  },
  leaderPtsNum: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primaryFixed,
    fontFamily: 'System',
    lineHeight: 32,
  },
  leaderPtsLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
});

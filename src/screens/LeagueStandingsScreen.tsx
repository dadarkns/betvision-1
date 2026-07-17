import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Medal, TrendingUp, Trophy } from 'lucide-react-native';
import { GlassCard } from '../components/GlassCard';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { leagueStandings } from '../constants/data';
import { Grid, MiniBar, Pill, ScreenHeader, SectionLabel, StatTile } from './shared';

const ZONE_ACCENTS = {
  title: colors.primaryFixed,
  libertadores: colors.primaryFixed,
  sudamericana: colors.secondaryContainer,
  mid: colors.white20,
  relegation: colors.error,
} as const;

export function LeagueStandingsScreen() {
  const leader = leagueStandings[0];
  const top = leagueStandings.slice(0, 4);
  const relegation = leagueStandings.find(item => item.zone === 'relegation');

  return (
    <View style={styles.page}>
      <ScreenHeader
        kicker="Ligas"
        title="Brasileirão Série A"
        subtitle="Tabela compacta com zonas, tendência e leitura de performance."
        action={(
          <View style={styles.badgeStack}>
            <Pill label="Temporada 2024" active />
            <Pill label="Rodada 32 de 38" />
          </View>
        )}
      />

      <View style={styles.gridWrap}>
        <GlassCard style={styles.tableCard}>
          <SectionLabel title="Classificacao" action="Atualizada agora" />
          <View style={styles.tableHead}>
            <Text style={[styles.col, styles.colPos]}>Pos</Text>
            <Text style={[styles.col, styles.colTeam]}>Time</Text>
            <Text style={styles.col}>P</Text>
            <Text style={styles.col}>J</Text>
            <Text style={styles.col}>V</Text>
            <Text style={styles.col}>E</Text>
            <Text style={styles.col}>D</Text>
            <Text style={styles.col}>SG</Text>
          </View>

          {leagueStandings.map(item => {
            const accent = ZONE_ACCENTS[item.zone];
            return (
              <View key={item.pos} style={styles.row}>
                <View style={[styles.zoneBar, { backgroundColor: accent }]} />
                <Text style={[styles.col, styles.colPos, item.zone === 'title' && styles.leaderPos, item.zone === 'relegation' && styles.relegationPos]}>
                  {String(item.pos).padStart(2, '0')}
                </Text>
                <View style={[styles.col, styles.colTeam]}>
                  <View style={styles.teamBadge} />
                  <Text style={styles.teamName} numberOfLines={1}>{item.team}</Text>
                </View>
                <Text style={[styles.col, item.zone === 'title' && styles.leaderPts, item.zone === 'relegation' && styles.relegationPts]}>{item.pts}</Text>
                <Text style={styles.col}>{item.played}</Text>
                <Text style={styles.col}>{item.won}</Text>
                <Text style={styles.col}>{item.drawn}</Text>
                <Text style={styles.col}>{item.lost}</Text>
                <Text style={[styles.col, item.gd > 0 ? styles.positive : item.gd < 0 ? styles.negative : null]}>
                  {item.gd > 0 ? `+${item.gd}` : item.gd}
                </Text>
              </View>
            );
          })}
        </GlassCard>

        <View style={styles.sideColumn}>
          <GlassCard style={styles.leaderCard} highlighted>
            <View style={styles.leaderHead}>
              <Trophy size={16} color={colors.primaryFixed} />
              <Text style={styles.leaderTitle}>Lider da temporada</Text>
            </View>
            <View style={styles.leaderBody}>
              <View style={styles.leaderShield} />
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{leader.team}</Text>
                <Text style={styles.leaderMeta}>{leader.pct.toFixed(1)}% de aproveitamento</Text>
                <View style={styles.formRow}>
                  {['V', 'V', 'E', 'V', 'V'].map((value, index) => (
                    <View key={index} style={[styles.formDot, value === 'V' ? styles.formWin : value === 'E' ? styles.formDraw : styles.formLoss]}>
                      <Text style={styles.formText}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.leaderPtsBox}>
                <Text style={styles.leaderPtsNum}>{leader.pts}</Text>
                <Text style={styles.leaderPtsLabel}>pts</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.topScorers}>
            <SectionLabel title="Zona de lideranca" action="Top 4" />
            {top.map((item, index) => (
              <View key={item.team} style={styles.rankRow}>
                <Text style={styles.rank}>{String(index + 1).padStart(2, '0')}</Text>
                <View style={styles.rankInfo}>
                  <Text style={styles.rankName}>{item.team}</Text>
                  <Text style={styles.rankMeta}>{item.pts} pontos</Text>
                </View>
                <Text style={styles.rankPct}>{item.pct.toFixed(1)}%</Text>
              </View>
            ))}
          </GlassCard>

          <Grid>
            <StatTile label="Líder" value={leader.pts} hint="pontos acumulados" accent={colors.primaryFixed} />
            <StatTile label="Zona" value="G4" hint="libertadores" accent={colors.secondaryContainer} />
            <StatTile label="Risco" value={relegation ? relegation.team : '0'} hint="zona vermelha" accent={colors.error} />
            <StatTile label="Média" value="2.42" hint="g/j" accent={colors.onSurface} />
          </Grid>
        </View>
      </View>

      <GlassCard style={styles.legendCard}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.primaryFixed }]} /><Text style={styles.legendText}>Libertadores</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.secondaryContainer }]} /><Text style={styles.legendText}>Sulamericana</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.white20 }]} /><Text style={styles.legendText}>Meio de tabela</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.error }]} /><Text style={styles.legendText}>Rebaixamento</Text></View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.md,
  },
  badgeStack: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  gridWrap: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  tableCard: {
    flex: 1,
    minWidth: 0,
    padding: spacing.lg,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
    position: 'relative',
  },
  zoneBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  col: {
    flex: 1,
    minWidth: 0,
    ...fonts.dataTable,
    color: colors.onSurface,
    fontSize: 12,
    textAlign: 'center',
  },
  colPos: {
    flex: 0.6,
    textAlign: 'left',
    paddingLeft: 8,
  },
  colTeam: {
    flex: 2.3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    textAlign: 'left',
  },
  teamBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
  },
  teamName: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  leaderPos: {
    color: colors.primaryFixed,
  },
  relegationPos: {
    color: colors.error,
  },
  leaderPts: {
    color: colors.primaryFixed,
    fontWeight: '700',
  },
  relegationPts: {
    color: colors.error,
    fontWeight: '700',
  },
  positive: {
    color: colors.primaryFixed,
  },
  negative: {
    color: colors.error,
  },
  sideColumn: {
    width: '100%',
    gap: spacing.md,
  },
  leaderCard: {
    padding: spacing.lg,
    gap: 12,
  },
  leaderHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderTitle: {
    ...fonts.headlineMd,
    color: colors.onSurface,
    textTransform: 'uppercase',
    fontSize: 15,
  },
  leaderBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderShield: {
    width: 70,
    height: 70,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryFixed,
    backgroundColor: 'rgba(119, 255, 95, 0.08)',
  },
  leaderInfo: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  leaderName: {
    ...fonts.headlineMd,
    color: colors.onSurface,
    textTransform: 'uppercase',
  },
  leaderMeta: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
  formRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  formDot: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formWin: { backgroundColor: 'rgba(119, 255, 95, 0.18)' },
  formDraw: { backgroundColor: colors.white10 },
  formLoss: { backgroundColor: 'rgba(255, 180, 171, 0.15)' },
  formText: {
    ...fonts.labelMono,
    color: colors.onSurface,
    fontSize: 9,
  },
  leaderPtsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  leaderPtsNum: {
    fontSize: 30,
    color: colors.primaryFixed,
    fontWeight: '800',
  },
  leaderPtsLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontSize: 9,
  },
  topScorers: {
    padding: spacing.lg,
    gap: 10,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  rank: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    width: 22,
  },
  rankInfo: {
    flex: 1,
    minWidth: 0,
  },
  rankName: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  rankMeta: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  rankPct: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 10,
  },
  legendCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
});
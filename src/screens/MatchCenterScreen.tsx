import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Activity, ChevronLeft, ChevronRight, Radio, Shield, Sparkles, Star, Trophy } from 'lucide-react-native';
import { GlassCard } from '../components/GlassCard';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { liveMatches, todaysMatches, topScorers } from '../constants/data';
import { Grid, MiniBar, Pill, ScreenHeader, SectionLabel, StatTile } from './shared';

const { width: SCREEN_W } = Dimensions.get('window');

export function MatchCenterScreen() {
  const isWide = SCREEN_W >= 1100;
  const mainMatch = liveMatches[0];
  const secondaryMatch = liveMatches[1];

  return (
    <View style={styles.page}>
      <ScreenHeader
        kicker="Match Center"
        title="Acompanhamento ao vivo"
        subtitle="Placar, xG e leitura tática em um único painel responsivo."
        action={(
          <View style={styles.headerActions}>
            <View style={styles.arrowPill}><ChevronLeft size={14} color={colors.onSurfaceVariant} /></View>
            <View style={styles.arrowPill}><ChevronRight size={14} color={colors.onSurfaceVariant} /></View>
          </View>
        )}
      />

      <GlassCard style={styles.scoreboard}>
        <View style={styles.scoreboardRow}>
          <View style={styles.teamBlock}>
            <View style={styles.clubMark} />
            <View>
              <Text style={styles.teamName}>{mainMatch.homeTeam}</Text>
              <Text style={styles.teamMeta}>Lider do campeonato</Text>
            </View>
          </View>

          <View style={styles.scoreBlock}>
            <Text style={styles.scoreHome}>{mainMatch.homeScore}</Text>
            <Text style={styles.scoreSep}>:</Text>
            <Text style={styles.scoreAway}>{mainMatch.awayScore}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{mainMatch.minute}'</Text>
            </View>
          </View>

          <View style={[styles.teamBlock, styles.teamBlockRight]}>
            <View>
              <Text style={[styles.teamName, styles.teamNameRight]}>{mainMatch.awayTeam}</Text>
              <Text style={[styles.teamMeta, styles.teamMetaRight]}>4o colocado</Text>
            </View>
            <View style={styles.clubMark} />
          </View>
        </View>

        <View style={styles.scoreboardFooter}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Estadio Monumental Striker</Text>
            <Text style={styles.metaLabel}>Publico: 48,200</Text>
          </View>
          <View style={styles.actionRow}>
            <View style={styles.iconButton}><Activity size={14} color={colors.primaryFixed} /></View>
            <View style={styles.iconButton}><Star size={14} color={colors.onSurfaceVariant} /></View>
          </View>
        </View>
      </GlassCard>

      <View style={[styles.heroGrid, isWide && styles.heroGridWide]}>
        <GlassCard style={styles.liveCard}>
          <SectionLabel title="Jogos de hoje" action="Ver todos" />
          <View style={styles.matchList}>
            {todaysMatches.map(match => (
              <View key={match.id} style={styles.matchRow}>
                <Text style={styles.matchTime}>{match.time}</Text>
                <Text style={styles.matchTeam}>{match.homeTeam}</Text>
                <View style={styles.vsPill}><Text style={styles.vsText}>VS</Text></View>
                <Text style={[styles.matchTeam, styles.matchTeamRight]}>{match.awayTeam}</Text>
                <View style={styles.probWrap}>
                  <Text style={styles.probLabel}>Chance de vitoria</Text>
                  <MiniBar left={match.winProb[0]} right={match.winProb[1] + match.winProb[2]} />
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

        <View style={styles.sideColumn}>
          <GlassCard style={styles.scorersCard}>
            <SectionLabel title="Artilheiros" action="Global" />
            <View style={styles.scorerList}>
              {topScorers.slice(0, 3).map((scorer, index) => (
                <View key={scorer.id} style={styles.scorerRow}>
                  <Text style={styles.scorerRank}>{String(index + 1).padStart(2, '0')}</Text>
                  <View style={styles.scorerAvatar}>
                    <Text style={styles.scorerInitial}>{scorer.name[0]}</Text>
                  </View>
                  <View style={styles.scorerInfo}>
                    <Text style={styles.scorerName}>{scorer.name}</Text>
                    <Text style={styles.scorerClub}>{scorer.club}</Text>
                  </View>
                  <Text style={styles.scorerGoals}>{scorer.goals}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.promoCard} highlighted>
            <View style={styles.promoTop}>
              <Sparkles size={16} color={colors.primaryFixed} />
              <Text style={styles.promoKicker}>Precisao Pro</Text>
            </View>
            <Text style={styles.promoTitle}>Acesso total a algoritmos preditivos, heatmaps e scouts detalhados.</Text>
            <View style={styles.ctaPill}><Text style={styles.ctaText}>Assinar por R$ 29,90/mes</Text></View>
          </GlassCard>
        </View>
      </View>

      <Grid style={styles.statGrid}>
        <StatTile label="Ao vivo" value={liveMatches.length} hint="jogos em tempo real" accent={colors.primaryFixed} />
        <StatTile label="Hoje" value={todaysMatches.length} hint="partidas analisadas" accent={colors.secondaryContainer} />
        <StatTile label="xG lider" value={secondaryMatch.xgHome.toFixed(2)} hint="melhor oportunidade" accent={colors.primaryFixed} />
        <StatTile label="Atividade" value="Alta" hint="mercado monitorado" accent={colors.onSurface} />
      </Grid>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowPill: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreboard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  scoreboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  teamBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 220,
  },
  teamBlockRight: {
    justifyContent: 'flex-end',
  },
  clubMark: {
    width: 72,
    height: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
  },
  teamName: {
    ...fonts.headlineLg,
    color: colors.onSurface,
    textTransform: 'uppercase',
    fontSize: 30,
    lineHeight: 32,
  },
  teamNameRight: {
    textAlign: 'right',
  },
  teamMeta: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  teamMetaRight: {
    textAlign: 'right',
  },
  scoreBlock: {
    alignItems: 'center',
    minWidth: 220,
    gap: 8,
  },
  scoreHome: {
    fontSize: 58,
    lineHeight: 58,
    color: colors.primaryFixed,
    fontWeight: '800',
  },
  scoreSep: {
    position: 'absolute',
    top: 14,
    left: '50%',
    marginLeft: -4,
    color: colors.onSurfaceVariant,
    opacity: 0.35,
    fontSize: 28,
    fontWeight: '700',
  },
  scoreAway: {
    position: 'absolute',
    right: -28,
    top: 14,
    fontSize: 58,
    lineHeight: 58,
    color: colors.onSurface,
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
  },
  statusText: {
    ...fonts.labelMono,
    color: colors.error,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  scoreboardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: colors.white5,
    paddingTop: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  metaLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.white10,
  },
  heroGrid: {
    gap: spacing.md,
  },
  heroGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  liveCard: {
    flex: 1,
    minWidth: 0,
    padding: spacing.lg,
  },
  sideColumn: {
    gap: spacing.md,
    width: '100%',
  },
  scorersCard: {
    padding: spacing.lg,
  },
  scorerList: {
    gap: 12,
  },
  scorerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scorerRank: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    width: 22,
  },
  scorerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorerInitial: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 12,
  },
  scorerInfo: {
    flex: 1,
    minWidth: 0,
  },
  scorerName: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  scorerClub: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  scorerGoals: {
    ...fonts.headlineMd,
    color: colors.primaryFixed,
    fontSize: 18,
  },
  promoCard: {
    padding: spacing.lg,
    gap: 12,
    backgroundColor: 'rgba(119, 255, 95, 0.08)',
  },
  promoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promoKicker: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  promoTitle: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    lineHeight: 20,
  },
  ctaPill: {
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaText: {
    ...fonts.labelMono,
    color: colors.onPrimaryFixed,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  matchList: {
    gap: 12,
  },
  matchRow: {
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    gap: 10,
  },
  matchTime: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
  matchTeam: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    flex: 1,
    minWidth: 0,
    fontWeight: '700',
  },
  matchTeamRight: {
    textAlign: 'right',
  },
  vsPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
  },
  vsText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
  probWrap: {
    gap: 6,
  },
  probLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  statGrid: {
    marginTop: spacing.sm,
  },
});
import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, FlatList, StyleSheet,
  Animated, Pressable, StatusBar, SafeAreaView,
} from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { LiveMatchCard } from '../components/LiveMatchCard';
import { colors, fonts, spacing } from '../constants/theme';
import { liveMatches, todaysMatches, topScorers } from '../constants/data';

function PulseDot() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[styles.pulseDot, { opacity: anim }]} />;
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action && <Text style={styles.sectionAction}>{action}</Text>}
    </View>
  );
}

function MatchRow({ match }: { match: typeof todaysMatches[0] }) {
  const maxProb = Math.max(...match.winProb);
  return (
    <GlassCard style={styles.matchRow}>
      <Text style={styles.matchTime}>{match.time}</Text>
      <View style={styles.matchTeams}>
        <Text style={styles.matchTeamName} numberOfLines={1}>{match.homeTeam}</Text>
        <View style={styles.matchVS}>
          <Text style={styles.matchVSText}>VS</Text>
        </View>
        <Text style={[styles.matchTeamName, styles.matchTeamRight]} numberOfLines={1}>{match.awayTeam}</Text>
      </View>
      <View style={styles.probBars}>
        {match.winProb.map((prob, i) => (
          <View
            key={i}
            style={[
              styles.probBar,
              { flex: prob },
              prob === maxProb ? styles.probBarActive : styles.probBarDim,
            ]}
          />
        ))}
      </View>
    </GlassCard>
  );
}

function ScorerRow({ scorer }: { scorer: typeof topScorers[0] }) {
  return (
    <View style={styles.scorerRow}>
      <Text style={[styles.scorerRank, scorer.rank === 1 && styles.scorerRankFirst]}>
        {String(scorer.rank).padStart(2, '0')}
      </Text>
      <View style={styles.scorerCircle}>
        <Text style={styles.scorerInitial}>{scorer.name[0]}</Text>
      </View>
      <View style={styles.scorerInfo}>
        <Text style={styles.scorerName}>{scorer.name}</Text>
        <Text style={styles.scorerClub}>{scorer.club}</Text>
      </View>
      <View style={styles.scorerGoals}>
        <Text style={[styles.scorerCount, scorer.rank === 1 && styles.scorerCountFirst]}>
          {scorer.goals}
        </Text>
        <Text style={styles.scorerGoalLabel}>gols</Text>
      </View>
    </View>
  );
}

export function DashboardScreen() {
  const [activeLeague, setActiveLeague] = React.useState('Todos');
  const leagues = ['Todos', 'Premier League', 'La Liga', 'Brasileirão', 'UCL'];
  const featuredPicks = [
    { label: 'Dupla chance', value: 'Arsenal ou empate', edge: '+18% value' },
    { label: 'Placar provável', value: 'Atlético vence', edge: '1.64 odds' },
    { label: 'Mercado quente', value: 'Haaland marca', edge: 'alta confiança' },
  ];

  const overviewStats = [
    { label: 'Ao vivo', value: liveMatches.length, hint: 'jogos em tempo real' },
    { label: 'Hoje', value: todaysMatches.length, hint: 'partidas analisadas' },
    { label: 'Artilheiros', value: topScorers.length, hint: 'ranking monitorado' },
  ];

  const filteredMatches = activeLeague === 'Todos'
    ? todaysMatches
    : todaysMatches.filter(m => m.league === activeLeague);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surfaceContainerLowest} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.liveFeed}>
              <PulseDot />
              <Text style={styles.liveFeedText}>LIVE FEED</Text>
            </View>
            <Text style={styles.headerTitle}>BETVISION</Text>
          </View>
          <Pressable style={styles.premiumPill}>
            <Text style={styles.premiumText}>GO PRO</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroKicker}>PANEL DE APOSTAS</Text>
              <Text style={styles.heroTitle}>Dados, forma e valor em um só lugar.</Text>
              <Text style={styles.heroSubtitle}>
                Acompanhe jogos, probabilidades e leitura de mercado antes de montar sua aposta.
              </Text>
            </View>
            <View style={styles.heroPulseCard}>
              <Text style={styles.heroPulseLabel}>ÍNDICE DE CONFIANÇA</Text>
              <Text style={styles.heroPulseValue}>82%</Text>
              <Text style={styles.heroPulseHint}>baseado em forma recente</Text>
            </View>
          </View>

          <View style={styles.overviewRow}>
            {overviewStats.map(stat => (
              <GlassCard key={stat.label} style={styles.overviewCard}>
                <Text style={styles.overviewLabel}>{stat.label}</Text>
                <Text style={styles.overviewValue}>{stat.value}</Text>
                <Text style={styles.overviewHint}>{stat.hint}</Text>
              </GlassCard>
            ))}
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryAction}>
              <Text style={styles.primaryActionText}>Montar aposta</Text>
            </Pressable>
            <Pressable style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>Ativar alertas</Text>
            </Pressable>
          </View>
        </View>

        {/* Featured Picks */}
        <View style={styles.sectionSpacing}>
          <SectionHeader title="OPORTUNIDADES" action="Ver leitura completa" />
          <View style={styles.pickGrid}>
            {featuredPicks.map(pick => (
              <GlassCard key={pick.label} style={styles.pickCard} highlighted>
                <Text style={styles.pickLabel}>{pick.label}</Text>
                <Text style={styles.pickValue}>{pick.value}</Text>
                <Text style={styles.pickEdge}>{pick.edge}</Text>
              </GlassCard>
            ))}
          </View>
        </View>

        {/* Live Matches */}
        <View style={styles.sectionSpacing}>
          <SectionHeader title="AO VIVO" />
          <FlatList
            data={liveMatches}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.liveList}
            renderItem={({ item }) => <LiveMatchCard match={item} />}
          />
        </View>

        {/* League Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {leagues.map(league => (
            <Pressable
              key={league}
              style={[styles.filterChip, activeLeague === league && styles.filterChipActive]}
              onPress={() => setActiveLeague(league)}
            >
              <Text style={[styles.filterText, activeLeague === league && styles.filterTextActive]}>
                {league}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Today's Matches */}
        <View style={styles.sectionSpacing}>
          <SectionHeader title="JOGOS DE HOJE" action="Ver todos" />
          <View style={styles.matchList}>
            {filteredMatches.length > 0
              ? filteredMatches.map(m => <MatchRow key={m.id} match={m} />)
              : <Text style={styles.emptyText}>Nenhum jogo nesta liga hoje.</Text>
            }
          </View>
        </View>

        {/* Top Scorers */}
        <View style={[styles.sectionSpacing, { marginBottom: spacing.xl + 20 }]}>
          <SectionHeader title="ARTILHEIROS" action="Ranking completo" />
          <GlassCard style={styles.scorersCard}>
            {topScorers.map(scorer => (
              <View key={scorer.id}>
                <ScorerRow scorer={scorer} />
                {scorer.rank < topScorers.length && (
                  <View style={styles.scorerDivider} />
                )}
              </View>
            ))}
          </GlassCard>
        </View>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  headerLeft: {
    gap: 2,
  },
  liveFeed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryFixed,
  },
  liveFeedText: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
  },
  headerTitle: {
    ...fonts.headlineLg,
    color: colors.primaryFixed,
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  hero: {
    margin: spacing.marginMobile,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.white10,
    gap: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'stretch',
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroKicker: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
  },
  heroTitle: {
    ...fonts.headlineLg,
    color: colors.onSurface,
    lineHeight: 32,
  },
  heroSubtitle: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
  },
  heroPulseCard: {
    width: 118,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.white10,
    justifyContent: 'space-between',
  },
  heroPulseLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  heroPulseValue: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.primaryFixed,
    letterSpacing: -1,
  },
  heroPulseHint: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  overviewCard: {
    flex: 1,
    padding: spacing.md,
    gap: 4,
  },
  overviewLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontSize: 9,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  overviewHint: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.primaryFixed,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    ...fonts.labelMono,
    color: colors.onPrimaryFixed,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.white5,
    borderWidth: 1,
    borderColor: colors.white10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    ...fonts.labelMono,
    color: colors.onSurface,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  premiumPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.primaryFixed,
    borderRadius: 999,
  },
  premiumText: {
    ...fonts.labelMono,
    color: colors.onPrimaryFixed,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionSpacing: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    backgroundColor: colors.primaryFixed,
    borderRadius: 2,
  },
  sectionTitle: {
    ...fonts.headlineMd,
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionAction: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  liveList: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.sm,
  },
  filterScroll: {
    marginTop: spacing.md,
    paddingLeft: spacing.marginMobile,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white10,
    marginRight: spacing.sm,
    backgroundColor: colors.white5,
  },
  filterChipActive: {
    backgroundColor: `${colors.primaryFixed}1A`,
    borderColor: `${colors.primaryFixed}60`,
  },
  filterText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  filterTextActive: {
    color: colors.primaryFixed,
  },
  pickGrid: {
    paddingHorizontal: spacing.marginMobile,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pickCard: {
    width: '48%',
    padding: spacing.md,
    gap: 6,
  },
  pickLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontSize: 9,
  },
  pickValue: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 15,
  },
  pickEdge: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    textTransform: 'uppercase',
    fontSize: 9,
  },
  matchList: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.sm,
  },
  matchRow: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  matchTime: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    width: 38,
    fontSize: 10,
  },
  matchTeams: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchTeamName: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '600',
    flex: 1,
  },
  matchTeamRight: {
    textAlign: 'right',
  },
  matchVS: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 4,
  },
  matchVSText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    fontWeight: '700',
  },
  probBars: {
    flexDirection: 'row',
    height: 4,
    width: 48,
    borderRadius: 2,
    overflow: 'hidden',
    gap: 1,
  },
  probBar: {
    height: '100%',
    borderRadius: 1,
  },
  probBarActive: {
    backgroundColor: colors.primaryFixed,
  },
  probBarDim: {
    backgroundColor: colors.white10,
  },
  emptyText: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  scorersCard: {
    marginHorizontal: spacing.marginMobile,
    padding: spacing.md,
  },
  scorerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  scorerRank: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.4,
    fontStyle: 'italic',
    width: 24,
  },
  scorerRankFirst: {
    color: colors.primaryFixed,
    opacity: 1,
  },
  scorerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.white10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorerInitial: {
    ...fonts.labelMono,
    color: colors.onSurface,
    fontWeight: '700',
  },
  scorerInfo: {
    flex: 1,
  },
  scorerName: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  scorerClub: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  scorerGoals: {
    alignItems: 'flex-end',
  },
  scorerCount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    fontFamily: 'System',
    lineHeight: 24,
  },
  scorerCountFirst: {
    color: colors.primaryFixed,
  },
  scorerGoalLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  scorerDivider: {
    height: 1,
    backgroundColor: colors.white5,
    marginVertical: 2,
  },
});

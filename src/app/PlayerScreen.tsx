import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Pressable, Dimensions,
} from 'react-native';
import Svg, { Circle, Polygon, Line, Text as SvgText } from 'react-native-svg';
import { GlassCard } from '../components/GlassCard';
import { colors, fonts, spacing } from '../constants/theme';
import { playerVinicius } from '../constants/data';

const { width: SCREEN_W } = Dimensions.get('window');

function RadarChart({ skills }: { skills: typeof playerVinicius.skills }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;

  const attrs = ['pace', 'dribbling', 'finishing', 'passing', 'physical'] as const;
  const labels = ['Vel.', 'Drible', 'Final.', 'Passe', 'Físico'];

  const points = attrs.map((key, i) => {
    const angle = (i * 2 * Math.PI) / attrs.length - Math.PI / 2;
    const val = (skills[key] / 100) * r;
    return { x: cx + val * Math.cos(angle), y: cy + val * Math.sin(angle) };
  });

  const labelPoints = attrs.map((_, i) => {
    const angle = (i * 2 * Math.PI) / attrs.length - Math.PI / 2;
    return { x: cx + (r + 16) * Math.cos(angle), y: cy + (r + 16) * Math.sin(angle) };
  });

  const gridPts = [0.25, 0.5, 0.75, 1].map(scale =>
    attrs.map((_, i) => {
      const angle = (i * 2 * Math.PI) / attrs.length - Math.PI / 2;
      return `${cx + scale * r * Math.cos(angle)},${cy + scale * r * Math.sin(angle)}`;
    }).join(' ')
  );

  const polyPts = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {gridPts.map((pts, i) => (
          <Polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        ))}
        {/* Axis lines */}
        {attrs.map((_, i) => {
          const angle = (i * 2 * Math.PI) / attrs.length - Math.PI / 2;
          return (
            <Line key={i}
              x1={cx} y1={cy}
              x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)}
              stroke="rgba(255,255,255,0.08)" strokeWidth={1}
            />
          );
        })}
        {/* Skill polygon */}
        <Polygon
          points={polyPts}
          fill="rgba(119,255,95,0.2)"
          stroke={colors.primaryFixed}
          strokeWidth={1.5}
        />
        {/* Labels */}
        {labelPoints.map((pt, i) => (
          <SvgText
            key={i}
            x={pt.x} y={pt.y}
            fill={colors.onSurfaceVariant}
            fontSize={7}
            textAnchor="middle"
            fontFamily="Courier"
          >{labels[i]}</SvgText>
        ))}
      </Svg>
    </View>
  );
}

function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={skillStyles.row}>
      <View style={skillStyles.labelRow}>
        <Text style={skillStyles.label}>{label}</Text>
        <Text style={[skillStyles.value, { color }]}>{value}%</Text>
      </View>
      <View style={skillStyles.track}>
        <View style={[skillStyles.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const skillStyles = StyleSheet.create({
  row: { marginBottom: spacing.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { ...fonts.labelMono, color: colors.onSurfaceVariant, textTransform: 'uppercase', fontSize: 10 },
  value: { ...fonts.labelMono, fontWeight: '700', fontSize: 11 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.white5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});

function MatchRow({ match }: { match: typeof playerVinicius.recentMatches[0] }) {
  const resultColors = { W: colors.primaryFixed, D: colors.onSurfaceVariant, L: colors.error };
  return (
    <View style={matchStyles.row}>
      <Text style={matchStyles.date}>{match.date}</Text>
      <View style={matchStyles.info}>
        <View style={matchStyles.teamsRow}>
          <Text style={matchStyles.team}>{match.home}</Text>
          <View style={matchStyles.scorePill}>
            <Text style={matchStyles.score}>{match.score}</Text>
          </View>
          <Text style={matchStyles.team}>{match.away}</Text>
        </View>
        <View style={matchStyles.statsRow}>
          {match.goals > 0 && (
            <Text style={matchStyles.statChip}>⚽ {match.goals} {match.goals === 1 ? 'gol' : 'gols'}</Text>
          )}
          {match.assists > 0 && (
            <Text style={[matchStyles.statChip, matchStyles.assistChip]}>🅰️ {match.assists} assist.</Text>
          )}
        </View>
      </View>
      <View style={[matchStyles.ratingBox, { borderColor: `${resultColors[match.result]}40` }]}>
        <Text style={[matchStyles.rating, { color: resultColors[match.result] }]}>
          {match.rating.toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

const matchStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.white5 },
  date: { ...fonts.labelMono, color: colors.onSurfaceVariant, fontSize: 9, width: 38, textAlign: 'center', textTransform: 'uppercase' },
  info: { flex: 1, gap: 4 },
  teamsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  team: { ...fonts.bodyMd, color: colors.onSurface, fontWeight: '600', fontSize: 12, flex: 1 },
  scorePill: { backgroundColor: colors.surfaceContainerHighest, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  score: { ...fonts.labelMono, color: colors.onSurface, fontWeight: '700', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statChip: { ...fonts.labelMono, color: colors.primaryFixed, fontSize: 9, textTransform: 'uppercase' },
  assistChip: { color: colors.secondaryContainer },
  ratingBox: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white5 },
  rating: { fontSize: 16, fontWeight: '700', fontFamily: 'System' },
});

export function PlayerScreen() {
  const player = playerVinicius;
  const [activeTab, setActiveTab] = useState<'stats' | 'matches'>('stats');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surfaceContainerLowest} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroImage}>
            <View style={styles.heroImagePlaceholder}>
              <Text style={styles.heroImageInitial}>VJ</Text>
            </View>
          </View>
          <View style={styles.heroContent}>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>REAL MADRID</Text>
              </View>
              <View style={[styles.heroBadge, styles.heroBadgeSecondary]}>
                <Text style={[styles.heroBadgeText, styles.heroBadgeTextSecondary]}>BRASIL</Text>
              </View>
            </View>
            <Text style={styles.heroName}>Vinícius{'\n'}<Text style={styles.heroNameAccent}>Júnior</Text></Text>
            <Text style={styles.heroMeta}>Ponta Esquerda • 23 anos</Text>
          </View>
        </View>

        {/* Key Stats */}
        <View style={styles.keyStats}>
          {[
            { label: 'Gols', value: player.goals, color: colors.primaryFixed },
            { label: 'Assist.', value: player.assists, color: colors.secondaryContainer },
            { label: 'Precisão', value: `${player.accuracy}%`, color: colors.onSurface },
            { label: 'Nota', value: player.rating, color: colors.primaryFixed },
          ].map(({ label, value, color }) => (
            <GlassCard key={label} style={styles.keyStatCard}>
              <Text style={styles.keyStatLabel}>{label}</Text>
              <Text style={[styles.keyStatValue, { color }]}>{value}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable style={[styles.tab, activeTab === 'stats' && styles.tabActive]} onPress={() => setActiveTab('stats')}>
            <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>ESTATÍSTICAS</Text>
          </Pressable>
          <Pressable style={[styles.tab, activeTab === 'matches' && styles.tabActive]} onPress={() => setActiveTab('matches')}>
            <Text style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>PARTIDAS</Text>
          </Pressable>
        </View>

        {activeTab === 'stats' ? (
          <View style={styles.section}>
            {/* Radar */}
            <GlassCard style={styles.radarCard}>
              <Text style={styles.cardTitle}>PERFIL DE HABILIDADES</Text>
              <View style={styles.radarRow}>
                <RadarChart skills={player.skills} />
                <View style={styles.radarStats}>
                  {Object.entries(player.skills).map(([key, val]) => (
                    <View key={key} style={styles.radarStatRow}>
                      <Text style={styles.radarStatKey}>{key.toUpperCase()}</Text>
                      <View style={styles.radarStatBar}>
                        <View style={[styles.radarStatFill, { width: `${val}%` }]} />
                      </View>
                      <Text style={styles.radarStatVal}>{val}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </GlassCard>

            {/* Performance bars */}
            <GlassCard style={styles.perfCard}>
              <Text style={styles.cardTitle}>PERFORMANCE RECENTE</Text>
              <SkillBar label="Duelos Ganhos" value={player.performance.duelsWon} color={colors.primaryFixed} />
              <SkillBar label="Dribles Completos" value={player.performance.dribblesCompleted} color={colors.secondaryContainer} />
              <View style={skillStyles.row}>
                <View style={skillStyles.labelRow}>
                  <Text style={skillStyles.label}>Velocidade Máx.</Text>
                  <Text style={[skillStyles.value, { color: colors.onSurface }]}>{player.performance.topSpeedKmh} km/h</Text>
                </View>
                <View style={skillStyles.track}>
                  <View style={[skillStyles.fill, { width: '90%', backgroundColor: colors.onSurface }]} />
                </View>
              </View>
            </GlassCard>
          </View>
        ) : (
          <GlassCard style={[styles.section, { marginHorizontal: spacing.marginMobile, marginBottom: spacing.xl + 20 }]}>
            <Text style={styles.cardTitle}>ÚLTIMAS PARTIDAS</Text>
            {player.recentMatches.map((match, i) => (
              <MatchRow key={i} match={match} />
            ))}
          </GlassCard>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  hero: {
    flexDirection: 'row',
    padding: spacing.marginMobile,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
    gap: spacing.md,
  },
  heroImage: {
    width: 110,
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.white20,
  },
  heroImagePlaceholder: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primaryFixed,
    opacity: 0.3,
    fontStyle: 'italic',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  heroBadges: { flexDirection: 'row', gap: 6 },
  heroBadge: {
    backgroundColor: `${colors.primaryFixed}1A`,
    borderWidth: 1,
    borderColor: `${colors.primaryFixed}40`,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  heroBadgeSecondary: {
    backgroundColor: colors.white5,
    borderColor: colors.white10,
  },
  heroBadgeText: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroBadgeTextSecondary: { color: colors.onSurfaceVariant },
  heroName: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.onSurface,
    fontFamily: 'System',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: 34,
    opacity: 0.8,
  },
  heroNameAccent: {
    fontWeight: '900',
    color: colors.primaryFixed,
    fontStyle: 'italic',
    opacity: 1,
  },
  heroMeta: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1,
  },
  keyStats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  keyStatCard: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  keyStatLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  keyStatValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 26,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
    paddingHorizontal: spacing.marginMobile,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: colors.primaryFixed,
  },
  tabText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  tabTextActive: {
    color: colors.primaryFixed,
  },
  section: {
    padding: spacing.marginMobile,
    gap: spacing.md,
    marginBottom: spacing.xl + 20,
  },
  radarCard: {
    padding: spacing.md,
  },
  cardTitle: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  radarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radarStats: {
    flex: 1,
    gap: 6,
  },
  radarStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radarStatKey: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 8,
    width: 42,
    textTransform: 'uppercase',
  },
  radarStatBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.white5,
    overflow: 'hidden',
  },
  radarStatFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primaryFixed,
  },
  radarStatVal: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontWeight: '700',
    fontSize: 10,
    width: 24,
    textAlign: 'right',
  },
  perfCard: {
    padding: spacing.md,
  },
});

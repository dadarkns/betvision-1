import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polygon, Line, Text as SvgText } from 'react-native-svg';
import { Award, BadgeCheck, ChartNoAxesCombined, Goal, LucideIcon, Shield } from 'lucide-react-native';
import { GlassCard } from '../components/GlassCard';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { playerVinicius } from '../constants/data';
import { Grid, MiniBar, Pill, ScreenHeader, SectionLabel, StatTile } from './shared';

function RadarChart({ skills }: { skills: typeof playerVinicius.skills }) {
  const size = 170;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const attrs = ['pace', 'dribbling', 'finishing', 'passing', 'physical'] as const;
  const labels = ['Velocidade', 'Drible', 'Finalização', 'Passe', 'Físico'];

  const points = attrs.map((key, index) => {
    const angle = (index * 2 * Math.PI) / attrs.length - Math.PI / 2;
    const value = (skills[key] / 100) * r;
    return `${cx + value * Math.cos(angle)},${cy + value * Math.sin(angle)}`;
  }).join(' ');

  const rings = [0.25, 0.5, 0.75, 1].map(scale =>
    attrs.map((_, index) => {
      const angle = (index * 2 * Math.PI) / attrs.length - Math.PI / 2;
      return `${cx + scale * r * Math.cos(angle)},${cy + scale * r * Math.sin(angle)}`;
    }).join(' ')
  );

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map((pts, index) => <Polygon key={index} points={pts} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />)}
      {attrs.map((_, index) => {
        const angle = (index * 2 * Math.PI) / attrs.length - Math.PI / 2;
        return <Line key={index} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
      })}
      <Polygon points={points} fill="rgba(119,255,95,0.2)" stroke={colors.primaryFixed} strokeWidth={1.5} />
      {labels.map((label, index) => {
        const angle = (index * 2 * Math.PI) / attrs.length - Math.PI / 2;
        return (
          <SvgText
            key={label}
            x={cx + (r + 14) * Math.cos(angle)}
            y={cy + (r + 14) * Math.sin(angle)}
            fill={colors.onSurfaceVariant}
            fontSize={7}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export function PlayerInsightsScreen() {
  const player = playerVinicius;
  const [tab, setTab] = useState<'stats' | 'matches'>('stats');

  return (
    <View style={styles.page}>
      <ScreenHeader
        kicker="Desempenho"
        title={player.name}
        subtitle="Perfil de habilidade, forma recente e leitura de desempenho individual."
        action={(
          <View style={styles.badges}>
            <Pill label="Real Madrid" active />
            <Pill label="PE | Brasil" />
          </View>
        )}
      />

      <View style={styles.heroGrid}>
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroPortrait}>
            <View style={styles.posterGlow} />
            <Text style={styles.posterInitials}>VJ</Text>
            <View style={styles.verifiedBadge}><BadgeCheck size={12} color={colors.primaryFixed} /></View>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroPosition}>Ponta esquerda / 23 anos</Text>
            <Text style={styles.heroName}>Vinicius <Text style={styles.heroAccent}>Junior</Text></Text>
            <Text style={styles.heroDesc}>Perfil de elite para duelos diretos, aceleração e impacto no terço final.</Text>
          </View>
          <View style={styles.heroMetrics}>
            <StatTile label="Gols" value={player.goals} accent={colors.primaryFixed} />
            <StatTile label="Assistencias" value={player.assists} accent={colors.secondaryContainer} />
            <StatTile label="Precisao" value={`${player.accuracy}%`} accent={colors.onSurface} />
            <StatTile label="Nota media" value={player.rating.toFixed(2)} accent={colors.primaryFixed} />
          </View>
        </GlassCard>

        <Grid style={styles.secondaryGrid}>
          <StatTile label="Forma" value="V V E V V" hint="últimas 5" accent={colors.primaryFixed} />
          <StatTile label="Vel. máx." value={`${player.performance.topSpeedKmh} km/h`} hint="pico recente" accent={colors.secondaryContainer} />
          <StatTile label="Duelos" value={`${player.performance.duelsWon}%`} hint="impacto físico" accent={colors.onSurface} />
          <StatTile label="Dribles" value={`${player.performance.dribblesCompleted}%`} hint="volume de 1v1" accent={colors.primaryFixed} />
        </Grid>
      </View>

      <View style={styles.tabsRow}>
        <Pill label="Estatísticas" active={tab === 'stats'} />
        <Pill label="Partidas" active={tab === 'matches'} />
      </View>

      {tab === 'stats' ? (
        <View style={styles.mainGrid}>
          <GlassCard style={styles.radarCard}>
            <SectionLabel title="Perfil de habilidades" action="Radar comparativo" />
            <View style={styles.radarWrap}>
              <RadarChart skills={player.skills} />
              <View style={styles.skillList}>
                {Object.entries(player.skills).map(([key, value]) => (
                  <View key={key} style={styles.skillRow}>
                    <Text style={styles.skillLabel}>{key}</Text>
                    <MiniBar left={value} right={100 - value} />
                    <Text style={styles.skillValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.formCard}>
            <SectionLabel title="Performance recente" action="Últimas 5" />
            <View style={styles.progressList}>
              <View style={styles.progressRow}><Text style={styles.progressLabel}>Duelos ganhos</Text><MiniBar left={player.performance.duelsWon} right={100 - player.performance.duelsWon} /><Text style={styles.progressValue}>{player.performance.duelsWon}%</Text></View>
              <View style={styles.progressRow}><Text style={styles.progressLabel}>Dribles completos</Text><MiniBar left={player.performance.dribblesCompleted} right={100 - player.performance.dribblesCompleted} leftColor={colors.secondaryContainer} /><Text style={styles.progressValue}>{player.performance.dribblesCompleted}%</Text></View>
              <View style={styles.progressRow}><Text style={styles.progressLabel}>Velocidade max</Text><MiniBar left={90} right={10} leftColor={colors.onSurface} /><Text style={styles.progressValue}>{player.performance.topSpeedKmh} km/h</Text></View>
            </View>
          </GlassCard>
        </View>
      ) : (
        <GlassCard style={styles.matchesCard}>
          <SectionLabel title="Ultimas partidas" action="Historico completo" />
          <View style={styles.matchList}>
            {player.recentMatches.map(match => (
              <View key={match.date} style={styles.matchRow}>
                <Text style={styles.matchDate}>{match.date}</Text>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchTeams}>{match.home} vs {match.away}</Text>
                  <Text style={styles.matchMeta}>{match.score} | {match.goals} gols | {match.assists} assistências</Text>
                </View>
                <View style={styles.matchRating}><Text style={styles.matchRatingText}>{match.rating.toFixed(1)}</Text></View>
              </View>
            ))}
          </View>
        </GlassCard>
      )}

      <Grid>
        <StatTile label="Chutes" value="Alto" hint="dentro da área" accent={colors.primaryFixed} />
        <StatTile label="Passe" value="72" hint="conclusão" accent={colors.secondaryContainer} />
        <StatTile label="Pressão" value="Elite" hint="condusão de bola" accent={colors.onSurface} />
        <StatTile label="Status" value="Verificado" hint="atleta" accent={colors.primaryFixed} />
      </Grid>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroGrid: {
    gap: spacing.md,
  },
  heroCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroPortrait: {
    minHeight: 220,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  posterGlow: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(119,255,95,0.08)',
  },
  posterInitials: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.primaryFixed,
    letterSpacing: -2,
  },
  verifiedBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.primaryFixed,
  },
  heroCopy: {
    gap: 6,
  },
  heroPosition: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  heroName: {
    ...fonts.headlineLg,
    color: colors.onSurface,
    textTransform: 'uppercase',
    fontSize: 28,
    lineHeight: 30,
  },
  heroAccent: {
    color: colors.primaryFixed,
  },
  heroDesc: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryGrid: {
    marginTop: spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mainGrid: {
    gap: spacing.md,
  },
  radarCard: {
    padding: spacing.lg,
  },
  radarWrap: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  skillList: {
    flex: 1,
    minWidth: 220,
    gap: 10,
  },
  skillRow: {
    gap: 6,
  },
  skillLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  skillValue: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 10,
  },
  formCard: {
    padding: spacing.lg,
  },
  progressList: {
    gap: 12,
  },
  progressRow: {
    gap: 6,
  },
  progressLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  progressValue: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 10,
  },
  matchesCard: {
    padding: spacing.lg,
  },
  matchList: {
    gap: 10,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
  },
  matchDate: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    width: 44,
  },
  matchInfo: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  matchTeams: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  matchMeta: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
  matchRating: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryFixed,
    backgroundColor: 'rgba(119,255,95,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchRatingText: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 13,
  },
});

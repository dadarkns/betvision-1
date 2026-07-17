import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Polygon, Line, Text as SvgText } from 'react-native-svg';
import { ChartNoAxesCombined, CornerDownRight, Trophy } from 'lucide-react-native';
import { GlassCard } from '../components/GlassCard';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { Grid, MiniBar, Pill, ScreenHeader, SectionLabel, StatTile } from './shared';

const leftPlayer = {
  name: 'Vini Jr.',
  club: 'Real Madrid',
  role: 'LW | Brazil',
  goals: 18,
  assists: 8,
  pass: 84,
};

const rightPlayer = {
  name: 'Mbappe',
  club: 'PSG / France',
  role: 'CF | France',
  goals: 24,
  assists: 7,
  pass: 81,
};

function CompareRadar() {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 64;
  const axes = ['pace', 'shoot', 'pass', 'dribble', 'defense'] as const;
  const a = [92, 81, 84, 95, 52];
  const b = [96, 92, 81, 88, 58];

  function polygon(values: number[]) {
    return values.map((value, index) => {
      const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2;
      const scaled = (value / 100) * r;
      return `${cx + scaled * Math.cos(angle)},${cy + scaled * Math.sin(angle)}`;
    }).join(' ');
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <Polygon
          key={scale}
          points={axes.map((_, index) => {
            const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2;
            return `${cx + scale * r * Math.cos(angle)},${cy + scale * r * Math.sin(angle)}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
        />
      ))}
      {axes.map((_, index) => {
        const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2;
        return <Line key={index} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="rgba(255,255,255,0.08)" />;
      })}
      <Polygon points={polygon(a)} fill="rgba(119,255,95,0.18)" stroke={colors.primaryFixed} strokeWidth={1.5} />
      <Polygon points={polygon(b)} fill="rgba(0,238,252,0.15)" stroke={colors.secondaryContainer} strokeWidth={1.5} />
      {['VELOCIDADE', 'FINALIZ.', 'PASSE', 'DRIBLE', 'DEFESA'].map((label, index) => {
        const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2;
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

export function ComparisonScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  return (
    <View style={styles.page}>
      <ScreenHeader
        kicker="Comparação"
        title="Comparação de Jogadores"
        subtitle="Lado a lado, radar de habilidades e leitura técnica de vantagem."
        action={(
          <View style={styles.pillRow}>
            <Pill label="LaLiga / Champions League" active />
            <Pill label="Buscar outro jogador..." />
          </View>
        )}
      />

      <View style={[styles.heroGrid, !isWide && { flexDirection: 'column' }]}>
        <GlassCard style={styles.playerCard}>
          <View style={styles.poster}>
            <View style={styles.posterGlow} />
            <View style={styles.posterBadge}><Text style={styles.posterBadgeText}>{leftPlayer.club}</Text></View>
            <Text style={styles.posterName}>Vini Jr.</Text>
            <Text style={styles.posterRole}>{leftPlayer.role}</Text>
          </View>
          <View style={styles.playerStats}>
            <StatTile label="Goals" value={leftPlayer.goals} accent={colors.primaryFixed} />
            <StatTile label="Assists" value={leftPlayer.assists} accent={colors.secondaryContainer} />
            <StatTile label="Pass %" value={leftPlayer.pass} accent={colors.onSurface} />
          </View>
        </GlassCard>

        <GlassCard style={styles.radarCard}>
          <SectionLabel title="Perfil de habilidades" action="Frente a frente" />
          <View style={styles.radarWrap}>
            <CompareRadar />
            <View style={styles.legendList}>
              <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: colors.primaryFixed }]} /><Text style={styles.legendText}>{leftPlayer.name}</Text></View>
              <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: colors.secondaryContainer }]} /><Text style={styles.legendText}>{rightPlayer.name}</Text></View>
            </View>
          </View>
          <View style={styles.verdictBox}>
            <ChartNoAxesCombined size={14} color={colors.primaryFixed} />
            <Text style={styles.verdictText}>Mbappe é mais clínico (+12% finalização)</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.playerCard}>
          <View style={[styles.poster, styles.posterRight]}>
            <View style={styles.posterGlowBlue} />
            <View style={styles.posterBadgeBlue}><Text style={styles.posterBadgeTextBlue}>{rightPlayer.club}</Text></View>
            <Text style={[styles.posterName, styles.posterNameRight]}>Mbappe</Text>
            <Text style={[styles.posterRole, styles.posterRoleRight]}>{rightPlayer.role}</Text>
          </View>
          <View style={styles.playerStats}>
            <StatTile label="Goals" value={rightPlayer.goals} accent={colors.secondaryContainer} />
            <StatTile label="Assists" value={rightPlayer.assists} accent={colors.primaryFixed} />
            <StatTile label="Pass %" value={rightPlayer.pass} accent={colors.onSurface} />
          </View>
        </GlassCard>
      </View>

      <GlassCard style={styles.tableCard}>
        <SectionLabel title="Métricas avançadas de desempenho" action="Todas as competições" />
        <View style={styles.tableHead}>
          <Text style={[styles.col, styles.colMetric]}>Estatística</Text>
          <Text style={[styles.col, styles.colLeft]}>Vini Jr.</Text>
          <Text style={styles.col}>Dif.</Text>
          <Text style={[styles.col, styles.colRight]}>K. Mbappé</Text>
        </View>
        {[
          { metric: 'Gols Esperados (xG)', left: '16.42', diff: '-', right: '21.85' },
          { metric: 'Dribles bem-sucedidos', left: '4.2 /90m', diff: '+1.4', right: '2.8 /90m' },
          { metric: '% Chutes no alvo', left: '41.2%', diff: '-7.1%', right: '48.3%' },
          { metric: 'Conduções progressivas', left: '124', diff: '+32', right: '92' },
          { metric: 'Passes-chave', left: '2.1 /90m', diff: 'Igual', right: '2.1 /90m' },
        ].map(row => (
          <View key={row.metric} style={styles.tableRow}>
            <Text style={[styles.col, styles.colMetric]}>{row.metric}</Text>
            <Text style={[styles.col, styles.colLeft, row.metric === 'Gols Esperados (xG)' && styles.strongLeft]}>{row.left}</Text>
            <Text style={[styles.col, styles.colDiff]}>{row.diff}</Text>
            <Text style={[styles.col, styles.colRight]}>{row.right}</Text>
          </View>
        ))}
      </GlassCard>

      <Grid>
        <StatTile label="Drible explosivo" value="Vinicius" hint="vantagem ao vivo" accent={colors.primaryFixed} />
        <StatTile label="Finalização clínica" value="Mbappe" hint="qualidade de chute" accent={colors.secondaryContainer} />
        <StatTile label="Projeção" value="98º" hint="percentil ofensivo" accent={colors.onSurface} />
        <StatTile label="Prob. vitória" value="74%" hint="ambos em forma" accent={colors.primaryFixed} />
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
  heroGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  playerCard: {
    flex: 1,
    minWidth: 0,
    padding: spacing.md,
    gap: 10,
  },
  poster: {
    minHeight: 240,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    gap: 4,
  },
  posterRight: {
    alignItems: 'flex-end',
  },
  posterGlow: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(119,255,95,0.08)',
  },
  posterGlowBlue: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,238,252,0.08)',
  },
  posterBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
  },
  posterBadgeBlue: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer,
  },
  posterBadgeText: {
    ...fonts.labelMono,
    color: colors.onPrimaryFixed,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  posterBadgeTextBlue: {
    ...fonts.labelMono,
    color: colors.onSecondaryContainer,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  posterName: {
    ...fonts.headlineLg,
    color: colors.onSurface,
    textTransform: 'uppercase',
    fontSize: 28,
    lineHeight: 30,
  },
  posterNameRight: {
    textAlign: 'right',
  },
  posterRole: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  posterRoleRight: {
    textAlign: 'right',
  },
  playerStats: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  radarCard: {
    flex: 1,
    minWidth: 280,
    padding: spacing.lg,
    gap: 10,
  },
  radarWrap: {
    alignItems: 'center',
    gap: 10,
  },
  legendList: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
  verdictBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
  },
  verdictText: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  tableCard: {
    padding: spacing.lg,
  },
  tableHead: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
  },
  col: {
    flex: 1,
    minWidth: 0,
    ...fonts.dataTable,
    color: colors.onSurface,
    fontSize: 12,
  },
  colMetric: {
    flex: 1.8,
  },
  colLeft: {
    flex: 0.9,
    textAlign: 'right',
    color: colors.primaryFixed,
  },
  colRight: {
    flex: 0.9,
    color: colors.secondaryContainer,
  },
  colDiff: {
    flex: 0.6,
    textAlign: 'center',
    color: colors.onSurfaceVariant,
  },
  strongLeft: {
    fontWeight: '700',
  },
});

import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  return (
    <View style={styles.page}>
      <ScreenHeader
        kicker="Análise de Time"
        title="Real Madrid"
        subtitle="Estrutura tática, volume de posse e forma recente em alta densidade."
        action={(
          <View style={styles.pillRow}>
            <Pill label="La Liga" active />
            <Pill label="Dados ao vivo" />
          </View>
        )}
      />

      <GlassCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.logoCard}>
            <View style={styles.logoMark} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Perfil de performance de elite para a temporada 2023/24.</Text>
            <Text style={styles.heroDesc}>Dominância tática estabelecida por pressão alta e profundidade vertical.</Text>
          </View>
          <View style={styles.gradeRing}>
            <Text style={styles.gradeValue}>8.5</Text>
            <Text style={styles.gradeLabel}>Season grade</Text>
          </View>
        </View>

        <View style={styles.heroMetrics}>
          <StatTile label="Prob. vitória" value="78.4%" accent={colors.primaryFixed} />
          <StatTile label="xG / jogo" value="2.42" accent={colors.secondaryContainer} />
          <StatTile label="PPDA" value="8.1" accent={colors.onSurface} />
          <StatTile label="Pressão" value="Alta" accent={colors.primaryFixed} />
        </View>
      </GlassCard>

      <View style={[styles.mainGrid, !isWide && { flexDirection: 'column' }]}>
        <GlassCard style={styles.boardCard}>
          <SectionLabel title="Painel Tático" action="Ataque" />
          <View style={styles.tacticalGrid}>
            {[
              { label: 'Posse de bola', value: '59.2%', accent: colors.primaryFixed },
              { label: 'Precisão de passe', value: '89.4%', accent: colors.primaryFixed },
              { label: 'Dist. média de chute', value: '16.8m', accent: colors.secondaryFixed },
              { label: 'Entradas no terço final', value: '48', accent: colors.secondaryFixed },
              { label: 'Pressões por jogo', value: '31.4', accent: colors.onSurfaceVariant },
              { label: 'Duelos ganhos', value: '54%', accent: colors.onSurfaceVariant },
            ].map(item => (
              <View key={item.label} style={styles.tacticalTile}>
                <Text style={[styles.tacticalValue, { color: item.accent }]}>{item.value}</Text>
                <Text style={styles.tacticalLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.formationRow}>
            {['4', '3', '3'].map((n, i) => (
              <View key={i} style={styles.formationSegment}>
                <Text style={styles.formationNumber}>{n}</Text>
              </View>
            ))}
            <Text style={styles.formationLabel}>Formação padrão — 4·3·3</Text>
          </View>
        </GlassCard>

        <View style={[styles.sideColumn, isWide && { width: 340 }]}>
          <GlassCard style={styles.performersCard}>
            <SectionLabel title="Melhores desempenhos" action="Ver elenco" />
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
            <SectionLabel title="Próximos jogos" />
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
              <Text style={styles.insightTitle}>Análise tática</Text>
            </View>
            <Text style={styles.insightText}>Madrid sobrecarrega pelo lado esquerdo com Vini Jr e Bellingham criando 4.2 chances de alto valor por partida.</Text>
          </GlassCard>
        </View>
      </View>

      <Grid>
        <StatTile label="Elenco" value="Elite" hint="4 formações" accent={colors.primaryFixed} />
        <StatTile label="Forma recente" value="V V E V V" hint="últimas 5" accent={colors.secondaryContainer} />
        <StatTile label="Chute méd." value="16.8m" hint="distância" accent={colors.onSurface} />
        <StatTile label="Pressão" value="Alta" hint="recuperação de bola" accent={colors.primaryFixed} />
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
    gap: spacing.md,
  },
  tacticalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tacticalTile: {
    flexBasis: '48%',
    minWidth: 120,
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    gap: 4,
  },
  tacticalValue: {
    ...fonts.headlineMd,
    fontSize: 22,
    lineHeight: 26,
  },
  tacticalLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  formationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.white10,
  },
  formationSegment: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryFixed,
    backgroundColor: 'rgba(101,255,75,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formationNumber: {
    ...fonts.headlineMd,
    color: colors.primaryFixed,
    fontSize: 16,
  },
  formationLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    textTransform: 'uppercase',
    flex: 1,
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

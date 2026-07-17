import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight, CircleDollarSign, Flame, Megaphone, TrendingUp } from 'lucide-react-native';
import { GlassCard } from '../components/GlassCard';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { recentTransfers } from '../constants/data';
import { Grid, MiniBar, Pill, ScreenHeader, SectionLabel, StatTile } from './shared';

const rumors = [
  { time: '5m', level: 'Alta', text: 'Man City entra na disputa por Musiala enquanto Bayern adia renovacao.' },
  { time: '24m', level: 'Media', text: 'Liverpool monitora zagueiros na Eredivisie para reforcar defesa.' },
  { time: '1h', level: 'Muito Alta', text: 'Juventus acerta termos pessoais com Nico Williams.' },
];

const windowRankings = [
  { rank: 1, player: 'Kylian Mbappe', club: 'Real Madrid (Free)', value: 'EUR180.0M' },
  { rank: 2, player: 'Victor Osimhen', club: 'Chelsea FC', value: 'EUR115.0M' },
  { rank: 3, player: 'Michael Olise', club: 'Bayern Munich', value: 'EUR60.0M' },
];

export function TransferCenterScreen() {
  return (
    <View style={styles.page}>
      <ScreenHeader
        kicker="Transferências"
        title="Central de Transferências"
        subtitle="Inteligência de mercado em tempo real, histórico e leitura de oportunidade."
        action={(
          <View style={styles.headerPills}>
            <Pill label="Mercado aberto" active />
            <Pill label="Prazo: 12d 14h 05m" />
          </View>
        )}
      />

      <View style={styles.gridWrap}>
        <View style={styles.leftColumn}>
          <GlassCard style={styles.chartCard}>
            <SectionLabel title="Tendências de Mercado" action="Janela '24" />
            <View style={styles.chartWrap}>
              {[18, 24, 28, 42, 22, 30, 48, 15, 20, 26].map((height, index) => (
                <View key={index} style={[styles.bar, { height: `${height}%`, backgroundColor: index < 7 ? `rgba(119, 255, 95, ${0.14 + index * 0.04})` : colors.white5 }]} />
              ))}
            </View>
            <View style={styles.chartLegend}>
              <Text style={styles.legendText}>Barras verdes = acordos ativos</Text>
              <Text style={styles.legendText}>Barras cinzas = gasto base</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.tableCard}>
            <SectionLabel title="Últimas Transferências" action="Ver todas" />
            <View style={styles.tableHead}>
              <Text style={[styles.col, styles.colPlayer]}>Jogador</Text>
              <Text style={[styles.col, styles.colRoute]}>De / Para</Text>
              <Text style={styles.col}>Taxa</Text>
              <Text style={styles.col}>Mercado</Text>
              <Text style={[styles.col, styles.colStatus]}>Status</Text>
            </View>
            {recentTransfers.map(transfer => (
              <View key={transfer.id} style={styles.row}>
                <View style={[styles.col, styles.colPlayer]}>
                  <View style={styles.avatar} />
                  <View>
                    <Text style={styles.playerName}>{transfer.player}</Text>
                    <Text style={styles.playerMeta}>{transfer.position} | {transfer.age} anos</Text>
                  </View>
                </View>
                <View style={[styles.col, styles.colRoute]}>
                  <Text style={styles.routeTeam}>{transfer.from}</Text>
                  <ArrowRight size={13} color={colors.primaryFixed} />
                  <Text style={styles.routeTeam}>{transfer.to}</Text>
                </View>
                <Text style={[styles.col, styles.fee]}>{transfer.fee}</Text>
                <Text style={[styles.col, styles.market]}>EUR{transfer.fee.replace('€', '')}</Text>
                <View style={[styles.status, transfer.status === 'done' && styles.statusDone, transfer.status === 'pending' && styles.statusPending, transfer.status === 'rumor' && styles.statusRumor]}>
                  <Text style={[styles.statusText, transfer.status === 'done' && styles.statusTextDone, transfer.status === 'pending' && styles.statusTextPending]}>{transfer.status}</Text>
                </View>
              </View>
            ))}
          </GlassCard>
        </View>

        <View style={styles.rightColumn}>
          <GlassCard style={styles.newsCard}>
            <SectionLabel title="Rumores e Notícias" />
            <View style={styles.newsList}>
              {rumors.map((item, index) => (
                <View key={item.time} style={[styles.newsItem, index < rumors.length - 1 && styles.newsDivider]}>
                  <Text style={styles.newsMeta}>{item.time} atrás | Confiabilidade: {item.level}</Text>
                  <Text style={styles.newsTitle}>{item.text}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.windowCard}>
            <SectionLabel title="Destaques da Janela" />
            <View style={styles.rankList}>
              {windowRankings.map(item => (
                <View key={item.rank} style={styles.rankRow}>
                  <Text style={styles.rank}>{String(item.rank).padStart(2, '0')}</Text>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankPlayer}>{item.player}</Text>
                    <Text style={styles.rankClub}>{item.club}</Text>
                  </View>
                  <Text style={styles.rankValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          <Grid>
            <StatTile label="Volume" value="EUR1.2B" hint="janelas ativas" accent={colors.primaryFixed} />
            <StatTile label="Quentes" value="15" hint="rumores fortes" accent={colors.secondaryContainer} />
            <StatTile label="Fechados" value={recentTransfers.length} hint="concluídos" accent={colors.onSurface} />
            <StatTile label="Momento" value="Alta" hint="mercado aquecido" accent={colors.error} />
          </Grid>
        </View>
      </View>

      <GlassCard style={styles.footerCard}>
        <View style={styles.footerItem}><CircleDollarSign size={16} color={colors.primaryFixed} /><Text style={styles.footerText}>Inteligência de taxas</Text></View>
        <View style={styles.footerItem}><TrendingUp size={16} color={colors.secondaryContainer} /><Text style={styles.footerText}>Rastreamento de valor</Text></View>
        <View style={styles.footerItem}><Flame size={16} color={colors.primaryFixed} /><Text style={styles.footerText}>Jogadores em alta</Text></View>
        <View style={styles.footerItem}><Megaphone size={16} color={colors.onSurfaceVariant} /><Text style={styles.footerText}>Alertas de mercado</Text></View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.md,
  },
  headerPills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  gridWrap: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.md,
  },
  rightColumn: {
    width: '100%',
    gap: spacing.md,
  },
  chartCard: {
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 220,
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 8,
    paddingTop: 10,
  },
  bar: {
    flex: 1,
    borderRadius: 4,
    minHeight: 18,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  legendText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  tableCard: {
    padding: spacing.lg,
    gap: 8,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  colPlayer: {
    flex: 2.1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colRoute: {
    flex: 1.8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colStatus: {
    flex: 0.9,
    textAlign: 'right',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
  },
  playerName: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  playerMeta: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  routeTeam: {
    flex: 1,
    ...fonts.bodyMd,
    color: colors.onSurface,
  },
  fee: {
    color: colors.primaryFixed,
    fontWeight: '700',
  },
  market: {
    color: colors.onSurfaceVariant,
  },
  status: {
    minWidth: 70,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 6,
    alignItems: 'center',
  },
  statusDone: {
    backgroundColor: 'rgba(119, 255, 95, 0.14)',
    borderColor: 'rgba(119, 255, 95, 0.28)',
  },
  statusPending: {
    backgroundColor: 'rgba(0, 238, 252, 0.08)',
  },
  statusRumor: {
    backgroundColor: colors.white5,
  },
  statusText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  statusTextDone: { color: colors.primaryFixed },
  statusTextPending: { color: colors.secondaryContainer },
  newsCard: {
    padding: spacing.lg,
  },
  newsList: {
    gap: 12,
  },
  newsItem: {
    gap: 6,
    paddingBottom: 12,
  },
  newsDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
  },
  newsMeta: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  newsTitle: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
    lineHeight: 20,
  },
  windowCard: {
    padding: spacing.lg,
  },
  rankList: {
    gap: 10,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rank: {
    ...fonts.headlineMd,
    color: colors.onSurfaceVariant,
    opacity: 0.35,
    width: 28,
  },
  rankInfo: {
    flex: 1,
    minWidth: 0,
  },
  rankPlayer: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  rankClub: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  rankValue: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 10,
  },
  footerCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
});

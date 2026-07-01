import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Pressable,
} from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { colors, fonts, spacing } from '../constants/theme';
import { recentTransfers } from '../constants/data';

const STATUS_CONFIG = {
  done: { label: 'Concluído', bg: colors.primaryFixed, text: colors.onPrimaryFixed },
  pending: { label: 'Pendente', bg: 'transparent', text: colors.primaryFixed, border: colors.primaryFixed },
  rumor: { label: 'Rumor', bg: colors.white10, text: colors.onSurfaceVariant },
};

const rumors = [
  { time: '5m', reliability: 'Alta', text: 'Man City entra na disputa por Musiala enquanto Bayern adia renovação.' },
  { time: '24m', reliability: 'Média', text: 'Liverpool monitora zagueiros na Eredivisie para reforçar defesa.' },
  { time: '1h', reliability: 'Muito Alta', text: 'Juventus acerta termos pessoais com Nico Williams.' },
];

const topWindow = [
  { rank: 1, player: 'Kylian Mbappé', club: 'Real Madrid (Free)', value: '€180.0M', isTop: true },
  { rank: 2, player: 'Victor Osimhen', club: 'Chelsea FC', value: '€115.0M', isTop: false },
  { rank: 3, player: 'Michael Olise', club: 'Bayern Munich', value: '€60.0M', isTop: false },
];

function TransferRow({ transfer }: { transfer: typeof recentTransfers[0] }) {
  const config = STATUS_CONFIG[transfer.status];
  return (
    <View style={styles.transferRow}>
      <View style={styles.transferAvatar}>
        <Text style={styles.transferInitial}>{transfer.player[0]}</Text>
      </View>
      <View style={styles.transferInfo}>
        <Text style={styles.transferName}>{transfer.player}</Text>
        <Text style={styles.transferMeta}>{transfer.position} • {transfer.age} anos</Text>
        <View style={styles.transferPath}>
          <Text style={styles.transferClub}>{transfer.from}</Text>
          <Text style={styles.transferArrow}>→</Text>
          <Text style={styles.transferClub}>{transfer.to}</Text>
        </View>
      </View>
      <View style={styles.transferRight}>
        <Text style={styles.transferFee}>{transfer.fee}</Text>
        <View style={[
          styles.statusPill,
          { backgroundColor: config.bg },
          (transfer.status === 'pending') && styles.statusBorder,
        ]}>
          <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
        </View>
      </View>
    </View>
  );
}

export function TransfersScreen() {
  const [activeFilter, setActiveFilter] = useState<'done' | 'pending' | 'rumor' | 'all'>('all');
  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'done', label: 'Concluídos' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'rumor', label: 'Rumores' },
  ] as const;

  const filtered = activeFilter === 'all'
    ? recentTransfers
    : recentTransfers.filter(t => t.status === activeFilter);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surfaceContainerLowest} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>TRANSFER{'\n'}CENTER</Text>
            <Text style={styles.subtitle}>Inteligência de mercado em tempo real</Text>
          </View>
          <View style={styles.headerBadges}>
            <View style={styles.marketBadge}>
              <View style={styles.marketDot} />
              <Text style={styles.marketText}>MERCADO ABERTO</Text>
            </View>
            <View style={styles.deadlineBadge}>
              <Text style={styles.deadlineLabel}>Prazo:</Text>
              <Text style={styles.deadlineTime}>12d 14h</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {filters.map(({ key, label }) => (
            <Pressable
              key={key}
              style={[styles.filterChip, activeFilter === key && styles.filterChipActive]}
              onPress={() => setActiveFilter(key)}
            >
              <Text style={[styles.filterText, activeFilter === key && styles.filterTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Transfer List */}
        <GlassCard style={styles.transferCard}>
          <View style={styles.transferHeader}>
            <Text style={styles.sectionTitle}>ÚLTIMAS TRANSFERÊNCIAS</Text>
          </View>
          {filtered.map(t => (
            <TransferRow key={t.id} transfer={t} />
          ))}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma transferência nesta categoria.</Text>
          )}
        </GlassCard>

        {/* Top of Window */}
        <GlassCard style={styles.topCard}>
          <Text style={styles.sectionTitle}>TOP DA JANELA</Text>
          {topWindow.map(({ rank, player, club, value, isTop }) => (
            <View key={rank} style={styles.topRow}>
              <Text style={[styles.topRank, isTop && styles.topRankFirst]}>
                {String(rank).padStart(2, '0')}
              </Text>
              <View style={styles.topInfo}>
                <Text style={styles.topPlayer}>{player}</Text>
                <Text style={styles.topClub}>{club}</Text>
              </View>
              <View style={styles.topValue}>
                <Text style={[styles.topFee, isTop && { color: colors.primaryFixed }]}>{value}</Text>
                <Text style={styles.topFeeLabel}>VALOR</Text>
              </View>
            </View>
          ))}
        </GlassCard>

        {/* Rumors */}
        <GlassCard style={[styles.rumorsCard, { marginBottom: spacing.xl + 20 }]}>
          <View style={styles.rumorsHeader}>
            <Text style={styles.sectionTitle}>RUMORES E NOTÍCIAS</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
            </View>
          </View>
          {rumors.map((r, i) => (
            <View key={i} style={[styles.rumorItem, i < rumors.length - 1 && styles.rumorBorder]}>
              <View style={styles.rumorMeta}>
                <Text style={styles.rumorTime}>{r.time} atrás</Text>
                <View style={[
                  styles.reliabilityBadge,
                  r.reliability === 'Muito Alta' || r.reliability === 'Alta'
                    ? styles.reliabilityHigh
                    : styles.reliabilityMid,
                ]}>
                  <Text style={[
                    styles.reliabilityText,
                    r.reliability === 'Muito Alta' || r.reliability === 'Alta'
                      ? { color: colors.primaryFixed }
                      : { color: colors.onSurfaceVariant },
                  ]}>
                    {r.reliability}
                  </Text>
                </View>
              </View>
              <Text style={styles.rumorText}>{r.text}</Text>
            </View>
          ))}
        </GlassCard>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
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
  title: {
    ...fonts.headlineLg,
    color: colors.primaryFixedDim,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  subtitle: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
    marginTop: 4,
  },
  headerBadges: { gap: 6, alignItems: 'flex-end' },
  marketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.glassCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  marketDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryFixed,
  },
  marketText: {
    ...fonts.labelMono,
    color: colors.onSurface,
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  deadlineBadge: {
    backgroundColor: colors.glassCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  deadlineLabel: { ...fonts.labelMono, color: colors.onSurfaceVariant, fontSize: 9 },
  deadlineTime: { ...fonts.labelMono, color: colors.onSurface, fontWeight: '700', fontSize: 10 },
  filterRow: {
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.md,
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
  filterTextActive: { color: colors.primaryFixed },
  transferCard: {
    marginHorizontal: spacing.marginMobile,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  transferHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
    backgroundColor: colors.white5,
  },
  sectionTitle: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
  },
  transferAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.white10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferInitial: {
    ...fonts.headlineMd,
    color: colors.onSurfaceVariant,
    fontSize: 16,
  },
  transferInfo: { flex: 1, gap: 2 },
  transferName: {
    ...fonts.dataTable,
    color: colors.onSurface,
    fontWeight: '700',
  },
  transferMeta: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  transferPath: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  transferClub: {
    ...fonts.labelMono,
    color: colors.onSurface,
    fontSize: 10,
  },
  transferArrow: {
    color: colors.primaryFixed,
    fontSize: 11,
    fontWeight: '700',
  },
  transferRight: { alignItems: 'flex-end', gap: 6 },
  transferFee: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontWeight: '700',
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBorder: {
    borderWidth: 1,
    borderColor: colors.primaryFixed,
  },
  statusText: {
    ...fonts.labelMono,
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  emptyText: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    padding: spacing.lg,
  },
  topCard: {
    marginHorizontal: spacing.marginMobile,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
  },
  topRank: {
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
    color: colors.onSurfaceVariant,
    opacity: 0.3,
    width: 28,
  },
  topRankFirst: {
    color: colors.primaryFixed,
    opacity: 1,
  },
  topInfo: { flex: 1 },
  topPlayer: {
    ...fonts.dataTable,
    color: colors.onSurface,
    fontWeight: '700',
  },
  topClub: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  topValue: { alignItems: 'flex-end' },
  topFee: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontWeight: '700',
    fontSize: 12,
  },
  topFeeLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  rumorsCard: {
    marginHorizontal: spacing.marginMobile,
    overflow: 'hidden',
  },
  rumorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
    backgroundColor: colors.white5,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  rumorItem: {
    padding: spacing.md,
    gap: 6,
  },
  rumorBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.white5,
  },
  rumorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rumorTime: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  reliabilityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  reliabilityHigh: {
    backgroundColor: `${colors.primaryFixed}1A`,
  },
  reliabilityMid: {
    backgroundColor: colors.white5,
  },
  reliabilityText: {
    ...fonts.labelMono,
    fontSize: 8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  rumorText: {
    ...fonts.bodyMd,
    color: colors.onSurface,
    lineHeight: 20,
    fontSize: 13,
  },
});

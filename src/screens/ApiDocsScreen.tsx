import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { KeyRound, Lock, Route, Shield, Zap } from 'lucide-react-native';
import { GlassCard } from '../components/GlassCard';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { Grid, Pill, ScreenHeader, SectionLabel, StatTile } from './shared';

function Gauge({ value, label, accent, text }: { value: number; label: string; accent: string; text: string }) {
  const size = 118;
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <View style={styles.gaugeCard}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.white10} strokeWidth={8} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={accent} strokeWidth={8} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" rotation="-90" originX={size / 2} originY={size / 2} />
      </Svg>
      <View style={styles.gaugeText}>
        <Text style={styles.gaugeValue}>{value}</Text>
        <Text style={styles.gaugeLabel}>{label}</Text>
        <Text style={[styles.gaugeFoot, { color: accent }]}>{text}</Text>
      </View>
    </View>
  );
}

export function ApiDocsScreen() {
  return (
    <View style={styles.page}>
      <ScreenHeader
        kicker="Pro API"
        title="API Docs"
        subtitle="Chaves, saude do sistema e endpoints principais em um painel tecnico compacto."
        action={(
          <View style={styles.pillRow}>
            <Pill label="Authentication" active />
            <Pill label="Live status" />
          </View>
        )}
      />

      <View style={styles.gridWrap}>
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Pro API Settings</Text>
            <Text style={styles.heroDesc}>Manage your production keys and monitor real-time data ingestion performance across the network.</Text>
          </View>
          <View style={styles.gaugeRow}>
            <Gauge value={99} label="Health" accent={colors.primaryFixed} text="API status: optimal" />
            <Gauge value={75} label="Quota" accent={colors.secondaryContainer} text="Reset in 12h" />
          </View>
        </GlassCard>

        <GlassCard style={styles.statusCard}>
          <SectionLabel title="Latency" />
          <View style={styles.latencyRow}>
            <Text style={styles.latencyRegion}>EU-WEST-1</Text>
            <Text style={styles.latencyValue}>24ms</Text>
          </View>
          <View style={styles.latencyTrack}><View style={styles.latencyFill} /></View>
          <View style={styles.systemLoad}>
            <Text style={styles.systemText}>System load</Text>
            <View style={styles.sysBars}>
              <View style={[styles.sysBar, { height: 10 }]} />
              <View style={[styles.sysBar, { height: 18 }]} />
              <View style={[styles.sysBar, { height: 8 }]} />
              <View style={[styles.sysBar, { height: 14 }]} />
            </View>
          </View>
        </GlassCard>
      </View>

      <View style={styles.docsGrid}>
        <GlassCard style={styles.authCard}>
          <SectionLabel title="Authentication" action="Generate key" />
          <View style={styles.keyCard}>
            <View style={styles.keyTop}>
              <Text style={styles.keyLabel}>Production_key_01</Text>
              <Text style={styles.keyBadge}>Active</Text>
            </View>
            <View style={styles.keyLine}><Lock size={13} color={colors.primaryFixed} /><Text style={styles.keyValue}>sk_live_51N3f...H89u2L0pQx</Text></View>
          </View>
          <View style={[styles.keyCard, styles.keyMuted]}>
            <View style={styles.keyTop}>
              <Text style={styles.keyLabel}>Sandbox_key_dev</Text>
              <Text style={styles.keyBadgeMuted}>Expired</Text>
            </View>
            <View style={styles.keyLine}><KeyRound size={13} color={colors.onSurfaceVariant} /><Text style={styles.keyValueMuted}>sk_test_92Nk...9Xm3v5K7z</Text></View>
          </View>
          <View style={styles.bestPractice}>
            <Text style={styles.bestPracticeTitle}>Security Best Practices</Text>
            <Text style={styles.bestPracticeText}>Never share your production keys. Use environment-specific variables for staging and production pipelines.</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewDots}><View style={[styles.dot, { backgroundColor: colors.error }]} /><View style={[styles.dot, { backgroundColor: colors.secondaryContainer }]} /><View style={[styles.dot, { backgroundColor: colors.primaryFixed }]} /></View>
            <Text style={styles.previewTitle}>GET /matches/v1/live/premier_league</Text>
          </View>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{`{
  "status": "success",
  "timestamp": "2024-10-24T14:22:01Z",
  "data": {
    "match_id": "PL-2024-192",
    "teams": {
      "home": { "name": "Arsenal", "score": 2 },
      "away": { "name": "Liverpool", "score": 2 }
    },
    "metrics": {
      "possession": { "home": 52, "away": 48 },
      "expected_goals": { "home": 1.84, "away": 2.15 },
      "high_press_count": 14,
      "transition_speed": "high"
    }
  }
}`}</Text>
          </View>
        </GlassCard>
      </View>

      <GlassCard style={styles.endpointsCard}>
        <SectionLabel title="API Endpoints" action="4 live routes" />
        <View style={styles.endpointGrid}>
          {[
            { method: 'GET', path: '/matches', desc: 'Retrieve a comprehensive list of matches with real-time score updates.' },
            { method: 'GET', path: '/players', desc: 'Access player performance metrics, heatmaps and passing accuracy.' },
            { method: 'POST', path: '/webhooks', desc: 'Register callbacks for live match events and automated actions.' },
            { method: 'GET', path: '/analytics/radar', desc: 'Download data for player radar charts and tactical comparisons.' },
          ].map(item => (
            <View key={item.path} style={styles.endpointCard}>
              <View style={styles.endpointTop}>
                <Text style={[styles.method, item.method === 'POST' && styles.methodPost]}>{item.method}</Text>
                <Text style={styles.endpointPath}>{item.path}</Text>
              </View>
              <Text style={styles.endpointDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <Grid>
        <StatTile label="Requests" value="75,432" hint="of 100,000" accent={colors.primaryFixed} />
        <StatTile label="Uptime" value="99.8%" hint="global" accent={colors.secondaryContainer} />
        <StatTile label="Errors" value="0.2%" hint="status healthy" accent={colors.onSurface} />
        <StatTile label="Keys" value="2" hint="active" accent={colors.primaryFixed} />
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
  gridWrap: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  heroCard: {
    flex: 1,
    minWidth: 0,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroCopy: {
    gap: 6,
  },
  heroTitle: {
    ...fonts.headlineLg,
    color: colors.primaryFixed,
    textTransform: 'uppercase',
    fontSize: 24,
  },
  heroDesc: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  gaugeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gaugeCard: {
    width: 136,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  gaugeText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: {
    fontSize: 22,
    color: colors.onSurface,
    fontWeight: '800',
  },
  gaugeLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  gaugeFoot: {
    ...fonts.labelMono,
    fontSize: 8,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  statusCard: {
    width: '100%',
    maxWidth: 320,
    padding: spacing.lg,
    gap: 12,
  },
  latencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  latencyRegion: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 10,
  },
  latencyValue: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 12,
  },
  latencyTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.white10,
    overflow: 'hidden',
  },
  latencyFill: {
    width: '24%',
    height: '100%',
    backgroundColor: colors.primaryFixed,
  },
  systemLoad: {
    gap: 8,
  },
  systemText: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  sysBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  sysBar: {
    width: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryFixed,
  },
  docsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  authCard: {
    flex: 1,
    minWidth: 280,
    padding: spacing.lg,
    gap: 10,
  },
  keyCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    gap: 8,
  },
  keyMuted: {
    opacity: 0.65,
  },
  keyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  keyLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  keyBadge: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  keyBadgeMuted: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  keyLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyValue: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 11,
  },
  keyValueMuted: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  bestPractice: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primaryFixed,
    backgroundColor: 'rgba(119,255,95,0.06)',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: 6,
  },
  bestPracticeTitle: {
    ...fonts.bodyMd,
    color: colors.primaryFixed,
    fontWeight: '700',
  },
  bestPracticeText: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  previewCard: {
    flex: 1,
    minWidth: 320,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
  },
  previewDots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  previewTitle: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    fontSize: 9,
  },
  codeBlock: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: spacing.lg,
  },
  codeText: {
    ...fonts.labelMono,
    color: colors.primaryFixed,
    fontSize: 10,
    lineHeight: 16,
  },
  endpointsCard: {
    padding: spacing.lg,
  },
  endpointGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  endpointCard: {
    flexBasis: '48%',
    minWidth: 240,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    gap: 8,
  },
  endpointTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  method: {
    ...fonts.labelMono,
    color: colors.onPrimaryFixed,
    backgroundColor: colors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    fontSize: 9,
  },
  methodPost: {
    backgroundColor: colors.secondaryContainer,
    color: colors.onSecondaryContainer,
  },
  endpointPath: {
    ...fonts.headlineMd,
    color: colors.onSurface,
    fontSize: 16,
  },
  endpointDesc: {
    ...fonts.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
});

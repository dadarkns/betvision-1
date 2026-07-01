import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { GlassCard } from './GlassCard';
import { colors, fonts, spacing } from '../constants/theme';

interface LiveMatchCardProps {
  match: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    minute: string;
    status: 'live' | 'halftime' | 'upcoming';
    league: string;
    xgHome: number;
    xgAway: number;
    possessionHome: number;
    possessionAway: number;
  };
  onPress?: () => void;
}

export function LiveMatchCard({ match, onPress }: LiveMatchCardProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (match.status === 'live') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [match.status]);

  const isLive = match.status === 'live';
  const isHalftime = match.status === 'halftime';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <GlassCard style={styles.card}>
        {/* Status badge */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, isLive ? styles.liveBadge : isHalftime ? styles.halftimeBadge : styles.upcomingBadge]}>
            {isLive && (
              <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
            )}
            <Text style={[styles.statusText, isLive ? styles.liveText : isHalftime ? styles.halftimeText : styles.upcomingText]}>
              {isLive ? `${match.minute}'` : isHalftime ? 'HT' : match.minute}
            </Text>
          </View>
          <Text style={styles.league}>{match.league}</Text>
        </View>

        {/* Score */}
        <View style={styles.scoreRow}>
          <View style={styles.teamBlock}>
            <View style={styles.teamCircle} />
            <Text style={styles.teamName}>{match.homeTeam}</Text>
          </View>

          <View style={styles.scoreBlock}>
            <Text style={styles.scoreHome}>{match.homeScore}</Text>
            <Text style={styles.scoreSep}>:</Text>
            <Text style={styles.scoreAway}>{match.awayScore}</Text>
          </View>

          <View style={[styles.teamBlock, styles.teamBlockRight]}>
            <Text style={[styles.teamName, styles.teamNameRight]}>{match.awayTeam}</Text>
            <View style={styles.teamCircle} />
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>xG</Text>
            <View style={styles.metricBarWrap}>
              <Text style={[styles.metricVal, styles.accentText]}>{match.xgHome.toFixed(2)}</Text>
              <View style={styles.miniBar}>
                <View style={[styles.miniBarFill, { flex: match.xgHome }, { backgroundColor: colors.primaryFixed }]} />
                <View style={[styles.miniBarFill, { flex: match.xgAway }, { backgroundColor: colors.white20 }]} />
              </View>
              <Text style={styles.metricVal}>{match.xgAway.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Posse</Text>
            <View style={styles.metricBarWrap}>
              <Text style={[styles.metricVal, styles.accentText]}>{match.possessionHome}%</Text>
              <View style={styles.miniBar}>
                <View style={[styles.miniBarFill, { flex: match.possessionHome }, { backgroundColor: colors.primaryFixed }]} />
                <View style={[styles.miniBarFill, { flex: match.possessionAway }, { backgroundColor: colors.white20 }]} />
              </View>
              <Text style={styles.metricVal}>{match.possessionAway}%</Text>
            </View>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    padding: spacing.md,
    marginRight: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 5,
  },
  liveBadge: {
    backgroundColor: `${colors.primaryFixed}1A`,
    borderWidth: 1,
    borderColor: `${colors.primaryFixed}40`,
  },
  halftimeBadge: {
    backgroundColor: `${colors.error}1A`,
    borderWidth: 1,
    borderColor: `${colors.error}40`,
  },
  upcomingBadge: {
    backgroundColor: colors.white5,
    borderWidth: 1,
    borderColor: colors.white10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryFixed,
  },
  statusText: {
    ...fonts.labelMono,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  liveText: { color: colors.primaryFixed },
  halftimeText: { color: colors.error },
  upcomingText: { color: colors.onSurfaceVariant },
  league: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  teamBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamBlockRight: {
    justifyContent: 'flex-end',
  },
  teamCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white10,
    borderWidth: 1,
    borderColor: colors.white10,
  },
  teamName: {
    ...fonts.headlineMd,
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  teamNameRight: {
    textAlign: 'right',
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  scoreHome: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primaryFixed,
    letterSpacing: -1,
    fontFamily: 'System',
  },
  scoreSep: {
    fontSize: 24,
    color: colors.onSurfaceVariant,
    opacity: 0.4,
    fontWeight: '700',
  },
  scoreAway: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -1,
    fontFamily: 'System',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.white10,
  },
  metric: {
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    ...fonts.labelMono,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  metricBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    ...fonts.labelMono,
    color: colors.onSurface,
    fontWeight: '700',
    fontSize: 11,
  },
  accentText: {
    color: colors.primaryFixed,
  },
  miniBar: {
    flex: 1,
    flexDirection: 'row',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: colors.white5,
  },
  miniBarFill: {
    height: '100%',
  },
  metricDivider: {
    width: 1,
    backgroundColor: colors.white10,
    marginVertical: 2,
  },
});

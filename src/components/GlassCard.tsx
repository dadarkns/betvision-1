import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  highlighted?: boolean;
}

export function GlassCard({ children, style, highlighted }: GlassCardProps) {
  return (
    <View style={[styles.card, highlighted && styles.highlighted, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 12,
  },
  highlighted: {
    borderColor: `${colors.primaryFixed}4D`,
    shadowColor: colors.primaryFixed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
});

import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Platform,
} from 'react-native';
import { DashboardScreen } from './DashboardScreen';
import { LeagueScreen } from './LeagueScreen';
import { PlayerScreen } from './PlayerScreen';
import { TransfersScreen } from './TransfersScreen';
import { colors, fonts } from '../constants/theme';

type Tab = 'dashboard' | 'league' | 'player' | 'transfers';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Ao Vivo', icon: '⚡' },
  { key: 'league', label: 'Liga', icon: '🏆' },
  { key: 'player', label: 'Jogador', icon: '👤' },
  { key: 'transfers', label: 'Mercado', icon: '↔' },
];

function TabIcon({ icon, label, active, onPress }: {
  icon: string; label: string; active: boolean; onPress: () => void;
}) {
  return (
    <Pressable style={styles.tabItem} onPress={onPress}>
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active && <View style={styles.tabIndicator} />}
    </Pressable>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardScreen />;
      case 'league': return <LeagueScreen />;
      case 'player': return <PlayerScreen />;
      case 'transfers': return <TransfersScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TabIcon
            key={tab.key}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.white10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.4,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    ...fonts.labelMono,
    fontSize: 9,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: colors.primaryFixed,
  },
  tabIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 2,
    backgroundColor: colors.primaryFixed,
    borderRadius: 1,
    alignSelf: 'center',
  },
});

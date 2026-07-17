import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Activity, ArrowLeftRight, ChartNoAxesCombined, LogIn, Radio, Shield, Trophy } from 'lucide-react-native';
import { MatchCenterScreen } from '../screens/MatchCenterScreen';
import { LeagueStandingsScreen } from '../screens/LeagueStandingsScreen';
import { TransferCenterScreen } from '../screens/TransferCenterScreen';
import { PlayerInsightsScreen } from '../screens/PlayerInsightsScreen';
import { TeamAnalysisScreen } from '../screens/TeamAnalysisScreen';
import { ComparisonScreen } from '../screens/ComparisonScreen';
import { CommandCenterShell, ShellNavItem } from '../components/layout/CommandCenterShell';
import { colors, fonts, radius } from '../constants/theme';

type ViewKey = 'match' | 'league' | 'transfers' | 'insights' | 'analysis' | 'comparison';

const NAV_ITEMS: ShellNavItem[] = [
  { key: 'match', label: 'Partidas', icon: <Radio size={14} color="#65ff4b" /> },
  { key: 'league', label: 'Ligas', icon: <Trophy size={14} color="#65ff4b" /> },
  { key: 'transfers', label: 'Transferências', icon: <ArrowLeftRight size={14} color="#65ff4b" /> },
  { key: 'insights', label: 'Desempenho', icon: <ChartNoAxesCombined size={14} color="#65ff4b" /> },
  { key: 'analysis', label: 'Análise de Time', icon: <Shield size={14} color="#65ff4b" /> },
  { key: 'comparison', label: 'Comparação', icon: <Activity size={14} color="#65ff4b" /> },
];

export default function App() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewKey>('match');

  const renderView = () => {
    switch (activeView) {
      case 'match':      return <MatchCenterScreen />;
      case 'league':     return <LeagueStandingsScreen />;
      case 'transfers':  return <TransferCenterScreen />;
      case 'insights':   return <PlayerInsightsScreen />;
      case 'analysis':   return <TeamAnalysisScreen />;
      case 'comparison': return <ComparisonScreen />;
    }
  };

  // Botão "ENTRAR" → navega para a rota /login
  const loginButton = (
    <Pressable
      onPress={() => router.push('/login')}
      style={styles.loginBtn}
      id="topbar-login-btn"
    >
      <LogIn size={13} color={colors.onPrimaryFixed} strokeWidth={2.2} />
      <Text style={styles.loginBtnText}>ENTRAR</Text>
    </Pressable>
  );

  return (
    <CommandCenterShell
      activeNavKey={activeView}
      navItems={NAV_ITEMS}
      onNavigate={key => setActiveView(key as ViewKey)}
      searchPlaceholder="Buscar jogadores, clubes ou rumores..."
      rightAccessory={loginButton}
    >
      {renderView()}
    </CommandCenterShell>
  );
}

const styles = StyleSheet.create({
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryFixed,
  },
  loginBtnText: {
    ...fonts.labelMono,
    color: colors.onPrimaryFixed,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

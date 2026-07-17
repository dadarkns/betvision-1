import React, { useState } from 'react';
import { Activity, ArrowLeftRight, ChartNoAxesCombined, Radio, Shield, Trophy } from 'lucide-react-native';
import { MatchCenterScreen } from '../screens/MatchCenterScreen';
import { LeagueStandingsScreen } from '../screens/LeagueStandingsScreen';
import { TransferCenterScreen } from '../screens/TransferCenterScreen';
import { PlayerInsightsScreen } from '../screens/PlayerInsightsScreen';
import { TeamAnalysisScreen } from '../screens/TeamAnalysisScreen';
import { ComparisonScreen } from '../screens/ComparisonScreen';
import { CommandCenterShell, ShellNavItem } from '../components/layout/CommandCenterShell';

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
  const [activeView, setActiveView] = useState<ViewKey>('match');

  const renderView = () => {
    switch (activeView) {
      case 'match':
        return <MatchCenterScreen />;
      case 'league':
        return <LeagueStandingsScreen />;
      case 'transfers':
        return <TransferCenterScreen />;
      case 'insights':
        return <PlayerInsightsScreen />;
      case 'analysis':
        return <TeamAnalysisScreen />;
      case 'comparison':
        return <ComparisonScreen />;
    }
  };

  return (
    <CommandCenterShell
      activeNavKey={activeView}
      navItems={NAV_ITEMS}
      onNavigate={key => setActiveView(key as ViewKey)}
      searchPlaceholder="Buscar jogadores, clubes ou rumores..."
    >
      {renderView()}
    </CommandCenterShell>
  );
}

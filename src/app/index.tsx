import React, { useState } from 'react';
import { Activity, ArrowLeftRight, ChartNoAxesCombined, Radio, Route, Shield, Trophy } from 'lucide-react-native';
import { MatchCenterScreen } from '../screens/MatchCenterScreen';
import { LeagueStandingsScreen } from '../screens/LeagueStandingsScreen';
import { TransferCenterScreen } from '../screens/TransferCenterScreen';
import { PlayerInsightsScreen } from '../screens/PlayerInsightsScreen';
import { TeamAnalysisScreen } from '../screens/TeamAnalysisScreen';
import { ComparisonScreen } from '../screens/ComparisonScreen';
import { ApiDocsScreen } from '../screens/ApiDocsScreen';
import { CommandCenterShell, ShellNavItem } from '../components/layout/CommandCenterShell';

type ViewKey = 'match' | 'league' | 'transfers' | 'insights' | 'analysis' | 'comparison' | 'api';

const NAV_ITEMS: ShellNavItem[] = [
  { key: 'match', label: 'Match Center', icon: <Radio size={14} color="#77ff5f" /> },
  { key: 'league', label: 'Leagues', icon: <Trophy size={14} color="#77ff5f" /> },
  { key: 'transfers', label: 'Transfers', icon: <ArrowLeftRight size={14} color="#77ff5f" /> },
  { key: 'insights', label: 'Insights', icon: <ChartNoAxesCombined size={14} color="#77ff5f" /> },
  { key: 'analysis', label: 'Team Analysis', icon: <Shield size={14} color="#77ff5f" /> },
  { key: 'comparison', label: 'Comparison', icon: <Activity size={14} color="#77ff5f" /> },
  { key: 'api', label: 'Pro API', icon: <Route size={14} color="#77ff5f" /> },
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
      case 'api':
        return <ApiDocsScreen />;
    }
  };

  return (
    <CommandCenterShell
      activeNavKey={activeView}
      navItems={NAV_ITEMS}
      onNavigate={key => setActiveView(key as ViewKey)}
      searchPlaceholder="Search players, clubs, or rumors..."
    >
      {renderView()}
    </CommandCenterShell>
  );
}

export const colors = {
  // Primary
  primaryFixed: '#77ff5f',
  primaryFixedDim: '#12e600',
  onPrimaryFixed: '#012200',
  primary: '#edffe1',
  primaryContainer: '#2aff18',
  onPrimaryContainer: '#067100',

  // Secondary
  secondaryContainer: '#00eefc',
  secondaryFixed: '#7df4ff',
  secondaryFixedDim: '#00dbe9',
  onSecondaryContainer: '#00686f',
  secondary: '#d3fbff',
  onSecondary: '#00363a',

  // Surface
  surface: '#111317',
  surfaceContainer: '#1e2024',
  surfaceContainerHigh: '#282a2e',
  surfaceContainerHighest: '#333539',
  surfaceContainerLow: '#1a1c20',
  surfaceContainerLowest: '#0c0e12',
  surfaceDim: '#111317',
  surfaceBright: '#37393e',

  // On Surface
  onSurface: '#e2e2e8',
  onSurfaceVariant: '#baccb0',
  background: '#111317',
  onBackground: '#e2e2e8',

  // Error
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',

  // Tertiary
  tertiary: '#f9f9ff',
  tertiaryFixed: '#e1e2ea',
  tertiaryFixedDim: '#c4c6ce',
  onTertiaryFixedVariant: '#44474d',

  // Outline
  outline: '#85967c',
  outlineVariant: '#3b4b36',

  // Glass
  glassCard: 'rgba(26, 29, 37, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  white5: 'rgba(255, 255, 255, 0.05)',
  white10: 'rgba(255, 255, 255, 0.10)',
  white20: 'rgba(255, 255, 255, 0.20)',
};

export const fonts = {
  displayLg: {
    fontFamily: 'System',
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: 'System',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  headlineMd: {
    fontFamily: 'System',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontFamily: 'System',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  labelMono: {
    fontFamily: 'Courier',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.8,
  },
  dataTable: {
    fontFamily: 'System',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  gutter: 16,
  marginMobile: 16,
};

export const radius = {
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  full: 999,
};

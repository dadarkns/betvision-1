// BetVision – Paleta Dark (tema padrão)
export const colors = {
  // Primária — verde neon BetVision
  primaryFixed: '#65ff4b',          // verde marca (ativo, destaque, CTA)
  primaryFixedDim: '#4ed437',       // variação mais sólida
  onPrimaryFixed: '#071006',        // texto sobre verde primário
  primary: '#b9f7ad',               // variação clara da primária
  primaryContainer: '#1d4a1a',      // container verde escuro
  onPrimaryContainer: '#c8ffc0',    // texto sobre container verde

  // Secundária — ciano informativo
  secondaryContainer: '#78e7ff',    // ciano destaque
  secondaryFixed: '#62dbe8',        // ciano PerformanceShell
  secondaryFixedDim: '#4acbd8',     // ciano mais sólido
  onSecondaryContainer: '#001f24',  // texto sobre ciano
  secondary: '#65ff4b',             // mesmo que primary (BetVision usa verde para ambos)
  onSecondary: '#071006',

  // Superfícies — escala de fundos escuros
  surface: '#12151b',               // cards, paineis principais
  surfaceContainer: '#1a1e25',      // superfície alt / container
  surfaceContainerHigh: '#1c2027',  // paineis ativos/destacados
  surfaceContainerHighest: '#252a33',
  surfaceContainerLow: '#171b21',   // elementos elevados / raised
  surfaceContainerLowest: '#0c0f12',// fundo do shell / nav
  surfaceDim: '#12151b',
  surfaceBright: '#2b3038',

  // Texto
  onSurface: '#eef0f3',             // texto principal
  onSurfaceVariant: '#b9c8b3',      // texto claro secundário (pale)
  background: '#0b0d10',            // fundo geral das telas
  onBackground: '#eef0f3',

  // Semânticos
  danger: '#ff7b7b',                // erros, alertas, risco
  live: '#ff6b6b',                  // status ao vivo
  info: '#78e7ff',                  // informação/estados neutros ativos
  muted: '#727b70',                 // texto apagado
  silver: '#727b70',                // texto auxiliar

  // Error (compatibilidade)
  error: '#ff7b7b',
  errorContainer: '#5a1212',
  onError: '#2a0000',

  // Outline / bordas
  outline: '#2b3038',               // bordas e divisórias
  outlineVariant: '#1f2428',

  // Brilho / sombra
  glow: 'rgba(101, 255, 75, 0.2)',  // brilho verde suave

  // Glass / opacidades
  glassCard: 'rgba(18, 21, 27, 0.88)',
  glassBorder: 'rgba(101, 255, 75, 0.1)',
  white5: 'rgba(255, 255, 255, 0.05)',
  white10: 'rgba(255, 255, 255, 0.08)',
  white20: 'rgba(255, 255, 255, 0.16)',
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

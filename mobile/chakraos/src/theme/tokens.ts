// ChakraOS design tokens — ported from colors_and_type.css / _ds_manifest.json
// "Clinical Mysticism": instrumented reverence for inner state.

export const color = {
  // canvas / void
  black: '#020408',
  deep: '#0A0F1A',
  deeper: '#050811',
  rim: 'rgba(255,255,255,0.06)',
  rimStrong: 'rgba(255,255,255,0.12)',

  // clinical accents
  accent: '#22D3EE',
  vein: '#8B5CF6',
  leaf: '#4ADE80',
  blood: '#F43F5E',
  amber: '#FBBF24',

  // nine chakras
  ckEarth: '#78350F',
  ckRoot: '#F43F5E',
  ckSacral: '#FB923C',
  ckSolar: '#FBBF24',
  ckHeart: '#4ADE80',
  ckThroat: '#22D3EE',
  ckThird: '#6366F1',
  ckCrown: '#A855F7',
  ckSoul: '#E0E7FF',

  // aura / emotional state
  auCalm: '#67E8F9',
  auExcited: '#F472B6',
  auGrounded: '#84CC16',
  auDiffuse: '#94A3B8',

  // neutral text scale — never pure white
  fg1: '#F8FAFC',
  fg2: '#CBD5E1',
  fg3: '#94A3B8',
  fg4: '#64748B',
  fg5: '#475569',
  fgLabel: '#64748B',

  bgPage: '#020408',
  bgGlass: 'rgba(10,15,26,0.6)',
  bgGlassStrong: 'rgba(10,15,26,0.85)',
} as const;

export const font = {
  ui: 'Outfit_400Regular',
  uiMedium: 'Outfit_500Medium',
  uiSemibold: 'Outfit_600SemiBold',
  uiLight: 'Outfit_300Light',
  uiBold: 'Outfit_700Bold',
  uiBlack: 'Outfit_900Black',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
  journal: 'Lora_400Regular_Italic',
} as const;

export const type = {
  micro: 10,
  xs: 12,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 44,
  display: 64,
  hero: 88,
} as const;

export const space = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 24: 96,
} as const;

export const radius = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 28, full: 999,
} as const;

export const motion = {
  easeClinical: [0.4, 0, 0.2, 1] as const,
  easeInstrument: [0.175, 0.885, 0.32, 1.275] as const,
  durBreath: 6000,
  durHeartbeat: 1000,
  durDrift: 10000,
  durFast: 160,
  durBase: 280,
  durSlow: 520,
};

// The uppercase micro-label — the most-repeated atom in the whole system.
export const microLabelStyle = {
  fontFamily: font.uiBlack,
  fontSize: type.micro,
  letterSpacing: 2, // ~0.2em at 10px
  textTransform: 'uppercase' as const,
  color: color.fgLabel,
};

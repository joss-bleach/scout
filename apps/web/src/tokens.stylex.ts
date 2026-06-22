import * as stylex from '@stylexjs/stylex'

export const colors = stylex.defineVars({
  primary: '#132257',
  secondary: '#3DB7E4',
  surface: '#FFFFFF',
  background: '#F5F7FB',
  inverse: '#0A1530',
  ink: '#000A3C',
  accentHover: '#1E93C0',
  accentTint: '#E8F6FC',
  border: '#D2DAE8',
  borderSubtle: '#E9EDF5',
  textPrimary: '#131A2E',
  textSecondary: '#525E78',
  textMuted: '#8A95AD',
  onDark: '#FFFFFF',
  live: '#E4002B',
  success: '#1E9E63',
  warning: '#E8A317',
  pitch: '#1F7A3D',
})

export const fonts = stylex.defineVars({
  display: '"Archivo", system-ui, sans-serif',
  body: '"Outfit", system-ui, sans-serif',
})

export const spacing = stylex.defineVars({
  s1: '4px',
  s2: '8px',
  s3: '12px',
  s4: '16px',
  s5: '20px',
  s6: '24px',
  s8: '32px',
  s10: '40px',
  s12: '48px',
  s16: '64px',
})

export const rounded = stylex.defineVars({
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
})

export const shadow = stylex.defineVars({
  e1: '0 1px 2px rgba(10,21,48,0.08)',
  e2: '0 4px 12px rgba(10,21,48,0.10)',
  e3: '0 12px 32px rgba(10,21,48,0.16)',
  focus: '0 0 0 3px rgba(61,183,228,0.45)',
})

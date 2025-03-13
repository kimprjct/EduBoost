export const colors = {
  primary: '#00F5FF', // Electric Teal
  secondary: '#7B42F6', // Neon Purple
  accent: '#2E6EFF', // Deep Blue

  background: {
    primary: '#0A0A1F', // Deep Dark Blue
    card: '#151530', // Slightly lighter dark blue
    secondary: '#1C1C3D', // Dark blue with purple tint
    gradient: ['#0A0A1F', '#151530', '#1C1C3D'],
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#B4B4DB',
    inverse: '#0A0A1F',
    accent: '#00F5FF',
  },

  border: {
    light: '#2A2A55',
    dark: '#151530',
  },

  success: '#00F5B4', // Neon Green
  error: '#FF4365', // Neon Red
  warning: '#FFB443', // Neon Orange
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
} as const;

export const shadows = {
  small: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;

export const layout = {
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  glowEffect: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  gradientBorder: {
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
} as const;

// Export types for TypeScript support
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Layout = typeof layout; 
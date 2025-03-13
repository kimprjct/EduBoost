export const colors = {
  primary: '#2563eb', // Blue
  secondary: '#0ea5e9', // Light Blue
  accent: '#14b8a6', // Teal
  success: '#22c55e', // Green
  warning: '#f59e0b', // Orange
  error: '#ef4444', // Red
  
  // Background colors
  background: {
    primary: '#f8fafc',
    secondary: '#f1f5f9',
    card: '#ffffff',
  },
  
  // Text colors
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    muted: '#94a3b8',
    inverse: '#ffffff',
  },

  // Border colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
  },

  // Status colors
  status: {
    active: '#22c55e',
    inactive: '#94a3b8',
    pending: '#f59e0b',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

export const layout = {
  container: {
    padding: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    ...shadows.medium,
  },
}; 
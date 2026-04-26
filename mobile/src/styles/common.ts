import { StyleSheet } from 'react-native'

// Color palette
export const colors = {
  primary: '#00ff88',
  secondary: '#333',
  background: '#0f0f0f',
  card: '#1a1a1a',
  text: '#fff',
  muted: '#888',
  error: '#ff6b6b',
  success: '#00ff88',
  warning: '#ffa500',
}

// Common spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

// Common border radius values
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
}

// Common font sizes
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

// Common font weights
export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
}

// Common shadow styles
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
}

// Common flex styles
export const flex = {
  row: {
    flexDirection: 'row',
  },
  col: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  around: {
    justifyContent: 'space-around',
  },
  evenly: {
    justifyContent: 'space-evenly',
  },
  start: {
    justifyContent: 'flex-start',
  },
  end: {
    justifyContent: 'flex-end',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignStretch: {
    alignItems: 'stretch',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  nowrap: {
    flexWrap: 'nowrap',
  },
}

// Common container styles
export const containers = {
  full: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  cardLg: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
}

// Common text styles
export const texts = {
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  heading: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    color: colors.text,
  },
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    color: colors.muted,
  },
  error: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    color: colors.error,
  },
  success: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    color: colors.success,
  },
  muted: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    color: colors.muted,
  },
}

// Utility function to create combined styles
export const createStyle = (base: any, overrides?: any) => {
  if (!overrides) return base
  return Array.isArray(base) ? [...base, overrides] : [base, overrides]
}

// Utility function to create responsive styles
export const createResponsiveStyle = (base: any, tablet?: any, desktop?: any) => {
  return base
}

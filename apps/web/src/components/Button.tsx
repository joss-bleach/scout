import * as stylex from '@stylexjs/stylex'
import { colors, fonts, spacing, rounded, shadow } from '../tokens.stylex.js'

type ButtonVariant = 'primary' | 'onDark' | 'secondary' | 'ghost'

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '44px',
    paddingInline: spacing.s6,
    borderRadius: rounded.md,
    fontFamily: fonts.body,
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: 1,
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    textDecoration: 'none',
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
    boxShadow: {
      default: 'none',
      ':focus-visible': shadow.focus,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    ':active': {
      transform: {
        default: 'none',
      },
    },
  },
  primary: {
    backgroundColor: {
      default: colors.secondary,
      ':hover': colors.accentHover,
      ':active': colors.accentHover,
    },
    color: {
      default: '#04263A',
      ':hover': colors.onDark,
    },
  },
  onDark: {
    backgroundColor: colors.surface,
    color: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    color: colors.primary,
    border: `1.5px solid ${colors.border}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.accentHover,
    paddingInline: spacing.s2,
  },
})

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant
  readonly children: React.ReactNode
}

export function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <button {...stylex.props(styles.base, styles[variant])} {...props}>
      {children}
    </button>
  )
}

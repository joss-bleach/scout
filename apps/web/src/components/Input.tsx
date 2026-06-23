import * as stylex from '@stylexjs/stylex'
import { colors, fonts, rounded, shadow, spacing } from '../tokens.stylex.js'

const styles = stylex.create({
  input: {
    display: 'block',
    width: '100%',
    height: '44px',
    paddingInline: spacing.s3,
    borderRadius: rounded.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    '::placeholder': {
      color: colors.textMuted,
    },
    ':focus-visible': {
      borderColor: colors.secondary,
      boxShadow: shadow.focus,
    },
  },
})

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input(props: InputProps) {
  return <input type="text" {...stylex.props(styles.input)} {...props} />
}

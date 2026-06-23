import * as stylex from '@stylexjs/stylex'
import { colors, spacing, rounded, shadow } from '../tokens.stylex.js'

const styles = stylex.create({
  card: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: rounded.lg,
    padding: spacing.s5,
    boxShadow: {
      default: shadow.e1,
      ':hover': shadow.e2,
    },
    transform: {
      default: 'none',
      ':hover': 'translateY(-2px)',
    },
    transition: 'box-shadow 0.15s ease, transform 0.15s ease',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      ':hover': {
        transform: 'none',
      },
    },
  },
})

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children: React.ReactNode
}

export function Card({ children, ...props }: CardProps) {
  return (
    <div {...stylex.props(styles.card)} {...props}>
      {children}
    </div>
  )
}

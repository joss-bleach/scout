import * as stylex from '@stylexjs/stylex'
import { colors, fonts, rounded } from '../tokens.stylex.js'

type PillVariant = 'live' | 'tag'

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: '10px',
    paddingBlock: '3px',
    borderRadius: rounded.full,
    fontFamily: fonts.body,
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1.27,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  live: {
    backgroundColor: colors.live,
    color: colors.onDark,
  },
  tag: {
    backgroundColor: colors.accentTint,
    color: colors.primary,
  },
})

interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly variant?: PillVariant
  readonly children: React.ReactNode
}

export function Pill({ variant = 'tag', children, ...props }: PillProps) {
  return (
    <span {...stylex.props(styles.base, styles[variant])} {...props}>
      {children}
    </span>
  )
}

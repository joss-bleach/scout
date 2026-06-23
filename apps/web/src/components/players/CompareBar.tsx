import * as stylex from '@stylexjs/stylex'
import { colors, fonts, spacing, rounded, shadow } from '../../tokens.stylex.js'

const styles = stylex.create({
  compareBar: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: colors.primary,
    color: colors.onDark,
    padding: `${spacing.s4} ${spacing.s6}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.s4,
    boxShadow: shadow.e3,
  },
  compareText: {
    fontFamily: fonts.body,
    fontSize: '14px',
  },
  compareLink: {
    display: 'inline-flex',
    alignItems: 'center',
    height: '44px',
    paddingInline: spacing.s6,
    borderRadius: rounded.md,
    backgroundColor: colors.secondary,
    color: '#04263A',
    fontFamily: fonts.body,
    fontSize: '16px',
    fontWeight: 700,
    textDecoration: 'none',
    outline: 'none',
    touchAction: 'manipulation',
    ':hover': {
      backgroundColor: colors.accentHover,
      color: colors.onDark,
    },
    ':focus-visible': {
      boxShadow: shadow.focus,
    },
  },
})

interface CompareBarProps {
  readonly selectedIds: readonly number[]
}

export function CompareBar({ selectedIds }: CompareBarProps) {
  return (
    <div {...stylex.props(styles.compareBar)}>
      <span {...stylex.props(styles.compareText)}>
        {selectedIds.length} players selected
      </span>
      <a
        href={`/compare?ids=${selectedIds.join(',')}`}
        {...stylex.props(styles.compareLink)}
      >
        Compare players
      </a>
    </div>
  )
}

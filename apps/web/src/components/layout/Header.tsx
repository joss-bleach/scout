import * as stylex from '@stylexjs/stylex'
import { colors, fonts, spacing, rounded, shadow } from '../../tokens.stylex.js'

const styles = stylex.create({
  header: {
    backgroundColor: colors.primary,
    color: colors.onDark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: spacing.s6,
    height: '64px',
    boxShadow: shadow.e2,
  },
  brand: {
    color: colors.onDark,
    fontFamily: fonts.display,
    fontSize: '22px',
    fontWeight: 800,
    textDecoration: 'none',
    letterSpacing: '-0.02em',
    outline: 'none',
    borderRadius: rounded.sm,
    touchAction: 'manipulation',
    boxShadow: {
      default: 'none',
      ':focus-visible': shadow.focus,
    },
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.s4,
  },
})

export function Header() {
  return (
    <header {...stylex.props(styles.header)}>
      <a href="/" {...stylex.props(styles.brand)}>Scout</a>
      <nav {...stylex.props(styles.nav)} aria-label="Main navigation">
      </nav>
    </header>
  )
}

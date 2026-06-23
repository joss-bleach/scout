import * as stylex from '@stylexjs/stylex'
import { colors, fonts, rounded, shadow, spacing } from '../../tokens.stylex.js'

const styles = stylex.create({
  footer: {
    backgroundColor: colors.inverse,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: '12px',
    paddingInline: spacing.s6,
    paddingBlock: spacing.s4,
    textAlign: 'center',
  },
  link: {
    color: colors.secondary,
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
    },
    borderRadius: rounded.sm,
    outline: 'none',
    boxShadow: {
      default: 'none',
      ':focus-visible': shadow.focus,
    },
  },
})

export function Footer() {
  return (
    <footer {...stylex.props(styles.footer)}>
      Data provided by{' '}
      <a
        href="https://github.com/statsbomb/open-data/blob/master/LICENSE.pdf"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.link)}
      >
        StatsBomb
      </a>
      {' '}under the Open Data licence.
    </footer>
  )
}

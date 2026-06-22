import * as stylex from '@stylexjs/stylex'
import { colors, fonts, spacing } from '../../tokens.stylex.js'

const styles = stylex.create({
  footer: {
    backgroundColor: colors.inverse,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: '12px',
    paddingInline: spacing.s6,
    paddingBlock: spacing.s4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s1,
  },
  link: {
    color: colors.secondary,
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
})

export function Footer() {
  return (
    <footer {...stylex.props(styles.footer)}>
      <span>Data provided by </span>
      <a
        href="https://github.com/statsbomb/open-data/blob/master/LICENSE.pdf"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.link)}
      >
        StatsBomb
      </a>
      <span> under the Open Data licence.</span>
    </footer>
  )
}

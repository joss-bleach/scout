import * as stylex from '@stylexjs/stylex'
import { colors, fonts, spacing } from './tokens.stylex.js'

const styles = stylex.create({
  root: {
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    minHeight: '100vh',
    padding: spacing.s6,
  },
  heading: {
    color: colors.primary,
    fontFamily: fonts.display,
    margin: 0,
  },
})

export function App() {
  return (
    <main {...stylex.props(styles.root)}>
      <h1 {...stylex.props(styles.heading)}>Scout</h1>
      <p>Football scouting and player comparison tool.</p>
    </main>
  )
}

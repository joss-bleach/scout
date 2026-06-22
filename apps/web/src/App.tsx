import * as stylex from '@stylexjs/stylex'
import { colors, spacing } from './tokens.stylex.js'

const styles = stylex.create({
  root: {
    backgroundColor: colors.background,
    minHeight: '100vh',
    padding: spacing.lg,
  },
  heading: {
    color: colors.primary,
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

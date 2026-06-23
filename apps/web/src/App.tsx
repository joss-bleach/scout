import * as stylex from '@stylexjs/stylex'
import { colors, fonts } from './tokens.stylex.js'
import { Header } from './components/layout/Header.js'
import { Footer } from './components/layout/Footer.js'
import { PlayerBrowser } from './components/players/PlayerBrowser.js'

const styles = stylex.create({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  main: {
    flex: 1,
  },
})

export function App() {
  return (
    <div {...stylex.props(styles.layout)}>
      <Header />
      <main {...stylex.props(styles.main)}>
        <PlayerBrowser />
      </main>
      <Footer />
    </div>
  )
}

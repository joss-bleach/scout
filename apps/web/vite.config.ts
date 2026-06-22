import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import styleXPlugin from '@stylexjs/rollup-plugin'
import styleXBabelPlugin from '@stylexjs/babel-plugin'

export default defineConfig({
  plugins: [
    styleXPlugin({
      fileName: 'stylex.css',
      useCSSLayers: false,
    }),
    react({
      babel: {
        plugins: [styleXBabelPlugin],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: 'index.html',
    },
  },
})

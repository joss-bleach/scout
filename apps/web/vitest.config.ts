import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import styleXPlugin from '@stylexjs/babel-plugin'
import path from 'node:path'
import fs from 'node:fs'

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.mtsx']

function resolveStyleXImport(importPath: string, sourceFilePath: string): string | null {
  const dir = path.dirname(sourceFilePath)
  const base = path.resolve(dir, importPath)
  const ext = path.extname(base)
  const baseNoExt = EXTENSIONS.includes(ext) ? base.slice(0, -ext.length) : base
  const candidates = [base, ...EXTENSIONS.map((e) => baseNoExt + e)]
  return candidates.find((c) => fs.existsSync(c)) ?? null
}

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            styleXPlugin,
            {
              unstable_moduleResolution: {
                type: 'custom' as const,
                getCanonicalFilePath: (filePath: string) => filePath,
                filePathResolver: resolveStyleXImport,
              },
            },
          ],
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: '../../packages/types/src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
})

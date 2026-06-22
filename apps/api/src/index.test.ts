import { describe, it, expect } from 'vitest'
import { app } from './app.js'

describe('API smoke test', () => {
  it('returns 200 from GET /', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const body: unknown = await res.json()
    expect(body).toEqual({ status: 'ok' })
  })
})

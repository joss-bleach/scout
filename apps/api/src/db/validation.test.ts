import { describe, it, expect } from 'vitest'
import { PlayerSchema, PlayerSeasonStatsSchema } from '@scout/types'
import { Schema } from 'effect'

describe('PlayerSchema', () => {
  it('decodes a valid player', () => {
    const result = Schema.decodeUnknownSync(PlayerSchema)({
      playerId: 42,
      name: 'Harry Kane',
      teamId: 1,
      position: 'Forward',
    })
    expect(result).toEqual({
      playerId: 42,
      name: 'Harry Kane',
      teamId: 1,
      position: 'Forward',
    })
  })

  it('accepts a null position', () => {
    const result = Schema.decodeUnknownSync(PlayerSchema)({
      playerId: 1,
      name: 'Unknown',
      teamId: 1,
      position: null,
    })
    expect(result.position).toBeNull()
  })

  it('rejects non-integer playerId', () => {
    expect(() =>
      Schema.decodeUnknownSync(PlayerSchema)({
        playerId: 'not-a-number',
        name: 'X',
        teamId: 1,
        position: null,
      }),
    ).toThrow()
  })
})

describe('PlayerSeasonStatsSchema', () => {
  const validStats = {
    playerId: 1,
    competitionId: 1,
    seasonId: 1,
    minutes: 90,
    appearances: 1,
    goals: 0,
    assists: 0,
    xG: '0.5',
    xA: '0.2',
    shots: 2,
    shotsOnTarget: 1,
    keyPasses: 3,
    passesAttempted: 40,
    passesCompleted: 35,
    passCompletionPct: '87.50',
    progressivePasses: 5,
    carries: 10,
    progressiveCarries: 3,
    successfulDribbles: 2,
    tackles: 1,
    interceptions: 0,
    ballRecoveries: 4,
    pressures: 6,
  }

  it('decodes a complete stats row', () => {
    const result = Schema.decodeUnknownSync(PlayerSeasonStatsSchema)(validStats)
    expect(result).toEqual(validStats)
  })

  it('rejects missing required fields', () => {
    expect(() =>
      Schema.decodeUnknownSync(PlayerSeasonStatsSchema)({ playerId: 1 }),
    ).toThrow()
  })

  it('preserves numeric strings (xG/xA) without coercion', () => {
    const result = Schema.decodeUnknownSync(PlayerSeasonStatsSchema)(validStats)
    expect(result.xG).toBe('0.5')
    expect(result.passCompletionPct).toBe('87.50')
  })
})

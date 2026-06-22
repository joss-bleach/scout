import { describe, it, expect } from 'vitest'
import {
  type Competition,
  type Team,
  type Player,
  type Match,
  type RawEvent,
  type PlayerSeasonStats,
  PlayerSchema,
  PlayerSeasonStatsSchema,
} from '@scout/types'
import { Schema } from 'effect'

describe('$inferSelect types from packages/types', () => {
  it('Competition type has correct shape', () => {
    const sample: Competition = {
      competitionId: 1,
      seasonId: 1,
      competitionName: 'Premier League',
      seasonName: '2015/16',
    }
    expect(sample.competitionId).toBe(1)
    expect(sample.competitionName).toBe('Premier League')
  })

  it('Team type has correct shape', () => {
    const sample: Team = { teamId: 1, name: 'Arsenal' }
    expect(sample.teamId).toBe(1)
  })

  it('Player type has correct shape', () => {
    const sample: Player = {
      playerId: 1,
      name: 'Test Player',
      teamId: 1,
      position: 'Forward',
    }
    expect(sample.playerId).toBe(1)
  })

  it('Match type has correct shape', () => {
    const sample: Match = {
      matchId: 1,
      competitionId: 1,
      seasonId: 1,
      homeTeamId: 1,
      awayTeamId: 2,
    }
    expect(sample.matchId).toBe(1)
  })

  it('RawEvent type has correct shape', () => {
    const sample: RawEvent = {
      eventId: 'abc-123',
      matchId: 1,
      data: { type: 'pass' },
    }
    expect(sample.eventId).toBe('abc-123')
  })

  it('PlayerSeasonStats type has all MVP metric fields', () => {
    const sample: PlayerSeasonStats = {
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
    expect(sample.xG).toBe('0.5')
    expect(sample.progressivePasses).toBe(5)
  })
})

describe('Effect Schema types', () => {
  it('PlayerSchema is a valid Effect Schema', () => {
    const result = Schema.decodeUnknownSync(PlayerSchema)({
      playerId: 42,
      name: 'Harry Kane',
      teamId: 1,
      position: 'Forward',
    })
    expect(result.playerId).toBe(42)
    expect(result.name).toBe('Harry Kane')
  })

  it('PlayerSchema rejects invalid input', () => {
    expect(() =>
      Schema.decodeUnknownSync(PlayerSchema)({ playerId: 'not-a-number' }),
    ).toThrow()
  })

  it('PlayerSeasonStatsSchema is a valid Effect Schema', () => {
    const result = Schema.decodeUnknownSync(PlayerSeasonStatsSchema)({
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
    })
    expect(result.xG).toBe('0.5')
    expect(result.pressures).toBe(6)
  })

  it('PlayerSeasonStatsSchema rejects missing required fields', () => {
    expect(() =>
      Schema.decodeUnknownSync(PlayerSeasonStatsSchema)({
        playerId: 1,
      }),
    ).toThrow()
  })
})

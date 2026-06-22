import { describe, it, expect } from 'vitest'
import {
  competitions,
  teams,
  players,
  matches,
  rawEvents,
  playerSeasonStats,
} from './schema.js'
import { getTableName } from 'drizzle-orm'

describe('Drizzle schema tables', () => {
  it('defines all six required tables', () => {
    expect(getTableName(competitions)).toBe('competitions')
    expect(getTableName(teams)).toBe('teams')
    expect(getTableName(players)).toBe('players')
    expect(getTableName(matches)).toBe('matches')
    expect(getTableName(rawEvents)).toBe('raw_events')
    expect(getTableName(playerSeasonStats)).toBe('player_season_stats')
  })

  it('competitions has correct columns', () => {
    const cols = Object.keys(competitions)
    expect(cols).toContain('competitionId')
    expect(cols).toContain('seasonId')
    expect(cols).toContain('competitionName')
    expect(cols).toContain('seasonName')
  })

  it('teams has correct columns', () => {
    const cols = Object.keys(teams)
    expect(cols).toContain('teamId')
    expect(cols).toContain('name')
  })

  it('players has correct columns', () => {
    const cols = Object.keys(players)
    expect(cols).toContain('playerId')
    expect(cols).toContain('name')
    expect(cols).toContain('teamId')
    expect(cols).toContain('position')
  })

  it('matches has correct columns', () => {
    const cols = Object.keys(matches)
    expect(cols).toContain('matchId')
    expect(cols).toContain('competitionId')
    expect(cols).toContain('seasonId')
    expect(cols).toContain('homeTeamId')
    expect(cols).toContain('awayTeamId')
  })

  it('rawEvents has correct columns', () => {
    const cols = Object.keys(rawEvents)
    expect(cols).toContain('eventId')
    expect(cols).toContain('matchId')
    expect(cols).toContain('data')
  })

  it('playerSeasonStats has all MVP metrics columns', () => {
    const cols = Object.keys(playerSeasonStats)
    const required = [
      'playerId',
      'competitionId',
      'seasonId',
      'minutes',
      'appearances',
      'goals',
      'assists',
      'xG',
      'xA',
      'shots',
      'shotsOnTarget',
      'keyPasses',
      'passesAttempted',
      'passesCompleted',
      'passCompletionPct',
      'progressivePasses',
      'carries',
      'progressiveCarries',
      'successfulDribbles',
      'tackles',
      'interceptions',
      'ballRecoveries',
      'pressures',
    ]
    for (const col of required) {
      expect(cols, `missing column: ${col}`).toContain(col)
    }
  })
})

import { describe, it, expect } from 'vitest'
import {
  buildCompetitionRow,
  buildTeamRow,
  buildPlayerRow,
  buildMatchRow,
  buildPlayerSeasonStatsRow,
} from './transform.js'
import type { SbCompetitionEntry, SbMatchEntry } from './types.js'
import type { PlayerRawSeasonStats, PlayerPer90Stats } from './aggregation.js'

const SB_COMPETITION: SbCompetitionEntry = {
  competition_id: 2,
  season_id: 27,
  competition_name: 'Premier League',
  season_name: '2015/2016',
}

const SB_MATCH: SbMatchEntry = {
  match_id: 3773566,
  competition: { competition_id: 2 },
  season: { season_id: 27 },
  home_team: { home_team_id: 36, home_team_name: 'Chelsea' },
  away_team: { away_team_id: 34, away_team_name: 'Leicester City' },
  home_score: 1,
  away_score: 1,
}

const RAW_SEASON: PlayerRawSeasonStats = {
  playerId: 10,
  teamId: 1,
  position: 'Center Forward',
  minutes: 2340,
  appearances: 26,
  goals: 25,
  assists: 14,
  xG: 18.7,
  xA: 11.2,
  shots: 120,
  shotsOnTarget: 60,
  keyPasses: 70,
  passesAttempted: 800,
  passesCompleted: 680,
  progressivePasses: 40,
  carries: 200,
  progressiveCarries: 60,
  successfulDribbles: 30,
  tackles: 20,
  interceptions: 10,
  ballRecoveries: 50,
  pressures: 150,
}

const PER90: PlayerPer90Stats = {
  goals: 0.96,
  assists: 0.54,
  xG: 0.72,
  xA: 0.43,
  shots: 4.62,
  shotsOnTarget: 2.31,
  keyPasses: 2.69,
  passesAttempted: 30.77,
  passesCompleted: 26.15,
  passCompletionPct: 85.0,
  progressivePasses: 1.54,
  carries: 7.69,
  progressiveCarries: 2.31,
  successfulDribbles: 1.15,
  tackles: 0.77,
  interceptions: 0.38,
  ballRecoveries: 1.92,
  pressures: 5.77,
}

describe('buildCompetitionRow', () => {
  it('maps competition_id and season_id', () => {
    const row = buildCompetitionRow(SB_COMPETITION)
    expect(row.competitionId).toBe(2)
    expect(row.seasonId).toBe(27)
  })

  it('maps competition and season names', () => {
    const row = buildCompetitionRow(SB_COMPETITION)
    expect(row.competitionName).toBe('Premier League')
    expect(row.seasonName).toBe('2015/2016')
  })
})

describe('buildTeamRow', () => {
  it('maps id and name', () => {
    const row = buildTeamRow(36, 'Chelsea')
    expect(row.teamId).toBe(36)
    expect(row.name).toBe('Chelsea')
  })
})

describe('buildPlayerRow', () => {
  it('maps all player fields', () => {
    const row = buildPlayerRow(42, 'Harry Kane', 1, 'Center Forward')
    expect(row.playerId).toBe(42)
    expect(row.name).toBe('Harry Kane')
    expect(row.teamId).toBe(1)
    expect(row.position).toBe('Center Forward')
  })

  it('allows null position', () => {
    const row = buildPlayerRow(42, 'Unknown', 1, null)
    expect(row.position).toBeNull()
  })
})

describe('buildMatchRow', () => {
  it('maps match_id', () => {
    const row = buildMatchRow(SB_MATCH)
    expect(row.matchId).toBe(3773566)
  })

  it('maps competition and season ids', () => {
    const row = buildMatchRow(SB_MATCH)
    expect(row.competitionId).toBe(2)
    expect(row.seasonId).toBe(27)
  })

  it('maps home and away team ids', () => {
    const row = buildMatchRow(SB_MATCH)
    expect(row.homeTeamId).toBe(36)
    expect(row.awayTeamId).toBe(34)
  })
})

describe('buildPlayerSeasonStatsRow', () => {
  const row = buildPlayerSeasonStatsRow(RAW_SEASON, PER90, 2, 27)

  it('maps player, competition, and season ids', () => {
    expect(row.playerId).toBe(10)
    expect(row.competitionId).toBe(2)
    expect(row.seasonId).toBe(27)
  })

  it('maps raw integer stats (minutes, appearances, goals, etc.)', () => {
    expect(row.minutes).toBe(2340)
    expect(row.appearances).toBe(26)
    expect(row.goals).toBe(25)
    expect(row.assists).toBe(14)
    expect(row.shots).toBe(120)
    expect(row.shotsOnTarget).toBe(60)
    expect(row.keyPasses).toBe(70)
    expect(row.passesAttempted).toBe(800)
    expect(row.passesCompleted).toBe(680)
    expect(row.progressivePasses).toBe(40)
    expect(row.carries).toBe(200)
    expect(row.progressiveCarries).toBe(60)
    expect(row.successfulDribbles).toBe(30)
    expect(row.tackles).toBe(20)
    expect(row.interceptions).toBe(10)
    expect(row.ballRecoveries).toBe(50)
    expect(row.pressures).toBe(150)
  })

  it('stores xG as a numeric string with 4 decimal places', () => {
    expect(typeof row.xG).toBe('string')
    expect(parseFloat(row.xG)).toBeCloseTo(0.72, 4)
  })

  it('stores xA as a numeric string with 4 decimal places', () => {
    expect(typeof row.xA).toBe('string')
    expect(parseFloat(row.xA)).toBeCloseTo(0.43, 4)
  })

  it('stores passCompletionPct as a numeric string with 2 decimal places', () => {
    expect(typeof row.passCompletionPct).toBe('string')
    expect(parseFloat(row.passCompletionPct)).toBeCloseTo(85.0, 2)
  })
})

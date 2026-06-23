import type { SbCompetitionEntry, SbMatchEntry } from './types.js'
import type { PlayerRawSeasonStats, PlayerPer90Stats } from './aggregation.js'

export interface CompetitionRow {
  readonly competitionId: number
  readonly seasonId: number
  readonly competitionName: string
  readonly seasonName: string
}

export interface TeamRow {
  readonly teamId: number
  readonly name: string
}

export interface PlayerRow {
  readonly playerId: number
  readonly name: string
  readonly teamId: number
  readonly position: string | null
}

export interface MatchRow {
  readonly matchId: number
  readonly competitionId: number
  readonly seasonId: number
  readonly homeTeamId: number
  readonly awayTeamId: number
}

export interface PlayerSeasonStatsRow {
  readonly playerId: number
  readonly competitionId: number
  readonly seasonId: number
  readonly minutes: number
  readonly appearances: number
  readonly goals: number
  readonly assists: number
  readonly xG: string
  readonly xA: string
  readonly shots: number
  readonly shotsOnTarget: number
  readonly keyPasses: number
  readonly passesAttempted: number
  readonly passesCompleted: number
  readonly passCompletionPct: string
  readonly progressivePasses: number
  readonly carries: number
  readonly progressiveCarries: number
  readonly successfulDribbles: number
  readonly tackles: number
  readonly interceptions: number
  readonly ballRecoveries: number
  readonly pressures: number
}

export function buildCompetitionRow(sbComp: SbCompetitionEntry): CompetitionRow {
  return {
    competitionId: sbComp.competition_id,
    seasonId: sbComp.season_id,
    competitionName: sbComp.competition_name,
    seasonName: sbComp.season_name,
  }
}

export function buildTeamRow(teamId: number, teamName: string): TeamRow {
  return { teamId, name: teamName }
}

export function buildPlayerRow(
  playerId: number,
  playerName: string,
  teamId: number,
  position: string | null,
): PlayerRow {
  return { playerId, name: playerName, teamId, position }
}

export function buildMatchRow(sbMatch: SbMatchEntry): MatchRow {
  return {
    matchId: sbMatch.match_id,
    competitionId: sbMatch.competition.competition_id,
    seasonId: sbMatch.season.season_id,
    homeTeamId: sbMatch.home_team.home_team_id,
    awayTeamId: sbMatch.away_team.away_team_id,
  }
}

export function buildPlayerSeasonStatsRow(
  raw: PlayerRawSeasonStats,
  per90: PlayerPer90Stats,
  competitionId: number,
  seasonId: number,
): PlayerSeasonStatsRow {
  return {
    playerId: raw.playerId,
    competitionId,
    seasonId,
    minutes: raw.minutes,
    appearances: raw.appearances,
    goals: raw.goals,
    assists: raw.assists,
    xG: per90.xG.toFixed(4),
    xA: per90.xA.toFixed(4),
    shots: raw.shots,
    shotsOnTarget: raw.shotsOnTarget,
    keyPasses: raw.keyPasses,
    passesAttempted: raw.passesAttempted,
    passesCompleted: raw.passesCompleted,
    passCompletionPct: per90.passCompletionPct.toFixed(2),
    progressivePasses: raw.progressivePasses,
    carries: raw.carries,
    progressiveCarries: raw.progressiveCarries,
    successfulDribbles: raw.successfulDribbles,
    tackles: raw.tackles,
    interceptions: raw.interceptions,
    ballRecoveries: raw.ballRecoveries,
    pressures: raw.pressures,
  }
}

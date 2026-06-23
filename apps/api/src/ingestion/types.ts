export type SbXY = [number, number]

export interface SbTeam {
  readonly id: number
  readonly name: string
}

export interface SbPlayer {
  readonly id: number
  readonly name: string
}

export interface SbOutcome {
  readonly id: number
  readonly name: string
}

export interface SbShot {
  readonly statsbomb_xg: number
  readonly outcome: SbOutcome
  readonly type: SbOutcome
}

export interface SbPass {
  readonly length: number
  readonly end_location: SbXY
  readonly outcome?: SbOutcome
  readonly goal_assist?: boolean
  readonly shot_assist?: boolean
  readonly xa?: number
}

export interface SbCarry {
  readonly end_location: SbXY
}

export interface SbDribble {
  readonly outcome: SbOutcome
}

export interface SbDuel {
  readonly type: SbOutcome
  readonly outcome?: SbOutcome
}

export interface SbSubstitution {
  readonly replacement: SbPlayer
  readonly outcome: SbOutcome
}

export interface SbLineupPlayer {
  readonly player: SbPlayer
  readonly position: SbOutcome
}

export interface SbTactics {
  readonly lineup: ReadonlyArray<SbLineupPlayer>
}

export interface SbEvent {
  readonly id: string
  readonly index: number
  readonly period: number
  readonly timestamp: string
  readonly minute: number
  readonly second: number
  readonly type: SbOutcome
  readonly team: SbTeam
  readonly player?: SbPlayer
  readonly position?: SbOutcome
  readonly location?: SbXY
  readonly shot?: SbShot
  readonly pass?: SbPass
  readonly carry?: SbCarry
  readonly dribble?: SbDribble
  readonly duel?: SbDuel
  readonly substitution?: SbSubstitution
  readonly tactics?: SbTactics
  readonly duration?: number
}

// StatsBomb Open Data API response types

export interface SbCompetitionEntry {
  readonly competition_id: number
  readonly season_id: number
  readonly competition_name: string
  readonly season_name: string
}

export interface SbMatchTeam {
  readonly home_team_id: number
  readonly home_team_name: string
}

export interface SbMatchAwayTeam {
  readonly away_team_id: number
  readonly away_team_name: string
}

export interface SbMatchEntry {
  readonly match_id: number
  readonly competition: { readonly competition_id: number }
  readonly season: { readonly season_id: number }
  readonly home_team: SbMatchTeam
  readonly away_team: SbMatchAwayTeam
  readonly home_score: number
  readonly away_score: number
}

// StatsBomb Open Data URLs
export const SB_BASE_URL =
  'https://raw.githubusercontent.com/statsbomb/open-data/master/data'

// PL 2015/16
export const PL_COMPETITION_ID = 2
export const PL_SEASON_ID = 27

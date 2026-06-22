export interface Player {
  readonly id: number
  readonly name: string
  readonly team: string
  readonly position: string
}

export interface PlayerSeasonStats {
  readonly playerId: number
  readonly competitionId: number
  readonly seasonId: number
  readonly minutes: number
  readonly appearances: number
  readonly goals: number
  readonly assists: number
  readonly xG: number
  readonly xA: number
  readonly shots: number
  readonly shotsOnTarget: number
  readonly keyPasses: number
  readonly passesAttempted: number
  readonly passesCompleted: number
  readonly passCompletionPct: number
  readonly progressivePasses: number
  readonly carries: number
  readonly progressiveCarries: number
  readonly successfulDribbles: number
  readonly tackles: number
  readonly interceptions: number
  readonly ballRecoveries: number
  readonly pressures: number
}

export interface Competition {
  readonly competitionId: number
  readonly seasonId: number
}

export interface Team {
  readonly teamId: number
  readonly name: string
}

export interface Match {
  readonly matchId: number
  readonly competitionId: number
  readonly seasonId: number
  readonly homeTeamId: number
  readonly awayTeamId: number
}

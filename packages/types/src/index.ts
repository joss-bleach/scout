export interface Player {
  id: number
  name: string
  team: string
  position: string
}

export interface PlayerSeasonStats {
  playerId: number
  competitionId: number
  seasonId: number
  minutes: number
  appearances: number
  goals: number
  assists: number
  xG: number
  xA: number
  shots: number
  shotsOnTarget: number
  keyPasses: number
  passesAttempted: number
  passesCompleted: number
  passCompletionPct: number
  progressivePasses: number
  carries: number
  progressiveCarries: number
  successfulDribbles: number
  tackles: number
  interceptions: number
  ballRecoveries: number
  pressures: number
}

export interface Competition {
  competitionId: number
  seasonId: number
}

export interface Team {
  teamId: number
  name: string
}

export interface Match {
  matchId: number
  competitionId: number
  seasonId: number
  homeTeamId: number
  awayTeamId: number
}

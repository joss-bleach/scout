import { Schema } from 'effect'
import type {
  competitions,
  teams,
  players,
  matches,
  rawEvents,
  playerSeasonStats,
} from './schema.js'

export {
  competitions as competitionsTable,
  teams as teamsTable,
  players as playersTable,
  matches as matchesTable,
  rawEvents as rawEventsTable,
  playerSeasonStats as playerSeasonStatsTable,
} from './schema.js'

export type Competition = typeof competitions.$inferSelect
export type Team = typeof teams.$inferSelect
export type Player = typeof players.$inferSelect
export type Match = typeof matches.$inferSelect
export type RawEvent = typeof rawEvents.$inferSelect
export type PlayerSeasonStats = typeof playerSeasonStats.$inferSelect

export const PlayerSchema = Schema.Struct({
  playerId: Schema.Int,
  name: Schema.String,
  teamId: Schema.Int,
  position: Schema.NullOr(Schema.String),
})

export const PlayerSeasonStatsSchema = Schema.Struct({
  playerId: Schema.Int,
  competitionId: Schema.Int,
  seasonId: Schema.Int,
  minutes: Schema.Int,
  appearances: Schema.Int,
  goals: Schema.Int,
  assists: Schema.Int,
  xG: Schema.String,
  xA: Schema.String,
  shots: Schema.Int,
  shotsOnTarget: Schema.Int,
  keyPasses: Schema.Int,
  passesAttempted: Schema.Int,
  passesCompleted: Schema.Int,
  passCompletionPct: Schema.String,
  progressivePasses: Schema.Int,
  carries: Schema.Int,
  progressiveCarries: Schema.Int,
  successfulDribbles: Schema.Int,
  tackles: Schema.Int,
  interceptions: Schema.Int,
  ballRecoveries: Schema.Int,
  pressures: Schema.Int,
})

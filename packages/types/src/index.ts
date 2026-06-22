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
  competitions,
  teams,
  players,
  matches,
  rawEvents,
  playerSeasonStats,
} from './schema.js'

export type Competition = Readonly<typeof competitions.$inferSelect>
export type Team = Readonly<typeof teams.$inferSelect>
export type Player = Readonly<typeof players.$inferSelect>
export type Match = Readonly<typeof matches.$inferSelect>
export type RawEvent = Readonly<typeof rawEvents.$inferSelect>
export type PlayerSeasonStats = Readonly<typeof playerSeasonStats.$inferSelect>

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

// Compile-time guards: TypeScript errors here if the hand-rolled Effect schemas
// drift from the Drizzle $inferSelect types (e.g. a column is added/renamed).
true satisfies Schema.Schema.Type<typeof PlayerSchema> extends Player ? true : false
true satisfies Schema.Schema.Type<typeof PlayerSeasonStatsSchema> extends PlayerSeasonStats ? true : false

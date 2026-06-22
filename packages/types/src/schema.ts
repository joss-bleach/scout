import {
  pgTable,
  integer,
  varchar,
  text,
  numeric,
  jsonb,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/pg-core'

export const competitions = pgTable(
  'competitions',
  {
    competitionId: integer('competition_id').notNull(),
    seasonId: integer('season_id').notNull(),
    competitionName: varchar('competition_name', { length: 255 }).notNull(),
    seasonName: varchar('season_name', { length: 255 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.competitionId, t.seasonId] })],
)

export const teams = pgTable('teams', {
  teamId: integer('team_id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
})

export const players = pgTable(
  'players',
  {
    playerId: integer('player_id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    teamId: integer('team_id').notNull(),
    position: varchar('position', { length: 100 }),
  },
  (t) => [
    foreignKey({ columns: [t.teamId], foreignColumns: [teams.teamId] }),
  ],
)

export const matches = pgTable(
  'matches',
  {
    matchId: integer('match_id').primaryKey(),
    competitionId: integer('competition_id').notNull(),
    seasonId: integer('season_id').notNull(),
    homeTeamId: integer('home_team_id').notNull(),
    awayTeamId: integer('away_team_id').notNull(),
  },
  (t) => [
    foreignKey({
      columns: [t.competitionId, t.seasonId],
      foreignColumns: [competitions.competitionId, competitions.seasonId],
    }),
    foreignKey({ columns: [t.homeTeamId], foreignColumns: [teams.teamId] }),
    foreignKey({ columns: [t.awayTeamId], foreignColumns: [teams.teamId] }),
  ],
)

export const rawEvents = pgTable(
  'raw_events',
  {
    eventId: text('event_id').primaryKey(),
    matchId: integer('match_id').notNull(),
    data: jsonb('data').notNull(),
  },
  (t) => [
    foreignKey({ columns: [t.matchId], foreignColumns: [matches.matchId] }),
  ],
)

export const playerSeasonStats = pgTable(
  'player_season_stats',
  {
    playerId: integer('player_id').notNull(),
    competitionId: integer('competition_id').notNull(),
    seasonId: integer('season_id').notNull(),
    minutes: integer('minutes').notNull().default(0),
    appearances: integer('appearances').notNull().default(0),
    goals: integer('goals').notNull().default(0),
    assists: integer('assists').notNull().default(0),
    xG: numeric('xg', { precision: 8, scale: 4 }).notNull().default('0'),
    xA: numeric('xa', { precision: 8, scale: 4 }).notNull().default('0'),
    shots: integer('shots').notNull().default(0),
    shotsOnTarget: integer('shots_on_target').notNull().default(0),
    keyPasses: integer('key_passes').notNull().default(0),
    passesAttempted: integer('passes_attempted').notNull().default(0),
    passesCompleted: integer('passes_completed').notNull().default(0),
    passCompletionPct: numeric('pass_completion_pct', {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default('0'),
    progressivePasses: integer('progressive_passes').notNull().default(0),
    carries: integer('carries').notNull().default(0),
    progressiveCarries: integer('progressive_carries').notNull().default(0),
    successfulDribbles: integer('successful_dribbles').notNull().default(0),
    tackles: integer('tackles').notNull().default(0),
    interceptions: integer('interceptions').notNull().default(0),
    ballRecoveries: integer('ball_recoveries').notNull().default(0),
    pressures: integer('pressures').notNull().default(0),
  },
  (t) => [
    primaryKey({
      columns: [t.playerId, t.competitionId, t.seasonId],
    }),
    foreignKey({ columns: [t.playerId], foreignColumns: [players.playerId] }),
    foreignKey({
      columns: [t.competitionId, t.seasonId],
      foreignColumns: [competitions.competitionId, competitions.seasonId],
    }),
  ],
)

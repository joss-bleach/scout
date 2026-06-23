import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { Data, Effect } from 'effect'
import { sql } from 'drizzle-orm'
import {
  competitions,
  teams,
  players,
  matches,
  rawEvents,
  playerSeasonStats,
} from '@scout/types'
import {
  SB_BASE_URL,
  PL_COMPETITION_ID,
  PL_SEASON_ID,
} from './types.js'
import type { SbEvent, SbCompetitionEntry, SbMatchEntry } from './types.js'
import {
  parseMatchEvents,
  computeMatchMinutes,
  computePer90,
} from './aggregation.js'
import type { PlayerRawSeasonStats } from './aggregation.js'
import {
  buildCompetitionRow,
  buildTeamRow,
  buildPlayerRow,
  buildMatchRow,
  buildPlayerSeasonStatsRow,
} from './transform.js'

class FetchError extends Data.TaggedError('FetchError')<{
  readonly url: string
  readonly cause: unknown
}> {}

class DbError extends Data.TaggedError('DbError')<{
  readonly cause: unknown
}> {}

class CompetitionNotFoundError extends Data.TaggedError(
  'CompetitionNotFoundError',
)<{
  readonly competitionId: number
  readonly seasonId: number
}> {}

const db = drizzle(postgres(process.env['DATABASE_URL'] ?? ''))

function fetchJson<T>(url: string): Effect.Effect<T, FetchError> {
  return Effect.tryPromise({
    try: () =>
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${url}`)
        return r.json() as Promise<T>
      }),
    catch: (cause) => new FetchError({ url, cause }),
  })
}

function dbRun<T>(promise: Promise<T>): Effect.Effect<T, DbError> {
  return Effect.tryPromise({
    try: () => promise,
    catch: (cause) => new DbError({ cause }),
  })
}

const program = Effect.gen(function* () {
  // 1. Fetch and upsert competition row
  const allComps = yield* fetchJson<SbCompetitionEntry[]>(
    `${SB_BASE_URL}/competitions.json`,
  )
  const comp = allComps.find(
    (c) =>
      c.competition_id === PL_COMPETITION_ID && c.season_id === PL_SEASON_ID,
  )
  if (!comp) {
    yield* Effect.fail(
      new CompetitionNotFoundError({
        competitionId: PL_COMPETITION_ID,
        seasonId: PL_SEASON_ID,
      }),
    )
    return
  }

  yield* dbRun(
    db
      .insert(competitions)
      .values(buildCompetitionRow(comp))
      .onConflictDoUpdate({
        target: [competitions.competitionId, competitions.seasonId],
        set: {
          competitionName: sql`excluded.competition_name`,
          seasonName: sql`excluded.season_name`,
        },
      }),
  )

  // 2. Fetch match list
  const allMatches = yield* fetchJson<SbMatchEntry[]>(
    `${SB_BASE_URL}/matches/${PL_COMPETITION_ID}/${PL_SEASON_ID}.json`,
  )
  console.log(`Found ${allMatches.length} matches for PL 2015/16`)

  // 3. Collect and upsert all teams from matches
  const teamsSeen = new Map<number, string>()
  for (const m of allMatches) {
    teamsSeen.set(m.home_team.home_team_id, m.home_team.home_team_name)
    teamsSeen.set(m.away_team.away_team_id, m.away_team.away_team_name)
  }

  const teamRows = Array.from(teamsSeen.entries()).map(([id, name]) =>
    buildTeamRow(id, name),
  )
  yield* dbRun(
    db
      .insert(teams)
      .values(teamRows)
      .onConflictDoUpdate({
        target: [teams.teamId],
        set: { name: sql`excluded.name` },
      }),
  )

  // 4. Upsert all matches
  const matchRows = allMatches.map(buildMatchRow)
  yield* dbRun(
    db
      .insert(matches)
      .values(matchRows)
      .onConflictDoUpdate({
        target: [matches.matchId],
        set: {
          homeTeamId: sql`excluded.home_team_id`,
          awayTeamId: sql`excluded.away_team_id`,
        },
      }),
  )

  // 5. Process each match: fetch events, parse stats, upsert raw_events + players
  const seasonAccumulator = new Map<number, PlayerRawSeasonStats>()
  const playersSeen = new Map<
    number,
    { name: string; teamId: number; position: string | null }
  >()

  for (let i = 0; i < allMatches.length; i++) {
    const match = allMatches[i]!
    const homeLabel = match.home_team.home_team_name
    const awayLabel = match.away_team.away_team_name
    console.log(
      `[${i + 1}/${allMatches.length}] Ingesting ${homeLabel} vs ${awayLabel}`,
    )

    const events = yield* fetchJson<SbEvent[]>(
      `${SB_BASE_URL}/events/${match.match_id}.json`,
    )

    // Upsert raw events
    if (events.length > 0) {
      const eventRows = events.map((e) => ({
        eventId: e.id,
        matchId: match.match_id,
        data: e,
      }))
      // Insert in chunks to avoid parameter limits
      for (let j = 0; j < eventRows.length; j += 500) {
        const chunk = eventRows.slice(j, j + 500)
        yield* dbRun(
          db
            .insert(rawEvents)
            .values(chunk)
            .onConflictDoUpdate({
              target: [rawEvents.eventId],
              set: { data: sql`excluded.data` },
            }),
        )
      }
    }

    // Parse stats
    const statsMap = parseMatchEvents(events)
    const minutesMap = computeMatchMinutes(events)

    // Collect player info and accumulate season stats
    for (const [playerId, matchStats] of statsMap) {
      // Track player metadata
      if (!playersSeen.has(playerId)) {
        playersSeen.set(playerId, {
          name: matchStats.playerName,
          teamId: matchStats.teamId,
          position: matchStats.position,
        })
      }

      // Accumulate season totals
      let season = seasonAccumulator.get(playerId)
      if (!season) {
        season = {
          playerId: matchStats.playerId,
          teamId: matchStats.teamId,
          position: matchStats.position,
          minutes: 0,
          appearances: 0,
          goals: 0,
          assists: 0,
          xG: 0,
          xA: 0,
          shots: 0,
          shotsOnTarget: 0,
          keyPasses: 0,
          passesAttempted: 0,
          passesCompleted: 0,
          progressivePasses: 0,
          carries: 0,
          progressiveCarries: 0,
          successfulDribbles: 0,
          tackles: 0,
          interceptions: 0,
          ballRecoveries: 0,
          pressures: 0,
        }
        seasonAccumulator.set(playerId, season)
      }

      season.minutes += minutesMap.get(playerId) ?? 0
      season.appearances++
      season.goals += matchStats.goals
      season.assists += matchStats.assists
      season.xG += matchStats.xG
      season.xA += matchStats.xA
      season.shots += matchStats.shots
      season.shotsOnTarget += matchStats.shotsOnTarget
      season.keyPasses += matchStats.keyPasses
      season.passesAttempted += matchStats.passesAttempted
      season.passesCompleted += matchStats.passesCompleted
      season.progressivePasses += matchStats.progressivePasses
      season.carries += matchStats.carries
      season.progressiveCarries += matchStats.progressiveCarries
      season.successfulDribbles += matchStats.successfulDribbles
      season.tackles += matchStats.tackles
      season.interceptions += matchStats.interceptions
      season.ballRecoveries += matchStats.ballRecoveries
      season.pressures += matchStats.pressures
    }
  }

  // 6. Upsert players
  if (playersSeen.size > 0) {
    const playerRows = Array.from(playersSeen.entries()).map(([id, info]) =>
      buildPlayerRow(id, info.name, info.teamId, info.position),
    )
    for (let j = 0; j < playerRows.length; j += 500) {
      const chunk = playerRows.slice(j, j + 500)
      yield* dbRun(
        db
          .insert(players)
          .values(chunk)
          .onConflictDoUpdate({
            target: [players.playerId],
            set: {
              name: sql`excluded.name`,
              teamId: sql`excluded.team_id`,
              position: sql`excluded.position`,
            },
          }),
      )
    }
  }

  // 7. Compute per-90 and upsert player_season_stats
  const statsRows = Array.from(seasonAccumulator.values()).map((raw) => {
    const per90 = computePer90(raw)
    return buildPlayerSeasonStatsRow(raw, per90, PL_COMPETITION_ID, PL_SEASON_ID)
  })

  if (statsRows.length > 0) {
    for (let j = 0; j < statsRows.length; j += 500) {
      const chunk = statsRows.slice(j, j + 500)
      yield* dbRun(
        db
          .insert(playerSeasonStats)
          .values(chunk)
          .onConflictDoUpdate({
            target: [
              playerSeasonStats.playerId,
              playerSeasonStats.competitionId,
              playerSeasonStats.seasonId,
            ],
            set: {
              minutes: sql`excluded.minutes`,
              appearances: sql`excluded.appearances`,
              goals: sql`excluded.goals`,
              assists: sql`excluded.assists`,
              xG: sql`excluded.xg`,
              xA: sql`excluded.xa`,
              shots: sql`excluded.shots`,
              shotsOnTarget: sql`excluded.shots_on_target`,
              keyPasses: sql`excluded.key_passes`,
              passesAttempted: sql`excluded.passes_attempted`,
              passesCompleted: sql`excluded.passes_completed`,
              passCompletionPct: sql`excluded.pass_completion_pct`,
              progressivePasses: sql`excluded.progressive_passes`,
              carries: sql`excluded.carries`,
              progressiveCarries: sql`excluded.progressive_carries`,
              successfulDribbles: sql`excluded.successful_dribbles`,
              tackles: sql`excluded.tackles`,
              interceptions: sql`excluded.interceptions`,
              ballRecoveries: sql`excluded.ball_recoveries`,
              pressures: sql`excluded.pressures`,
            },
          }),
      )
    }
  }

  console.log(
    `Ingestion complete: ${allMatches.length} matches, ${playersSeen.size} players`,
  )
})

Effect.runPromise(program).catch((err) => {
  console.error('Ingestion failed:', err)
  process.exit(1)
})

import { Effect } from 'effect'
import type { SbEvent } from './types.js'

export interface RawPlayerMatchStats {
  readonly playerId: number
  readonly playerName: string
  readonly teamId: number
  readonly teamName: string
  readonly position: string | null
  goals: number
  assists: number
  xG: number
  xA: number
  shots: number
  shotsOnTarget: number
  keyPasses: number
  passesAttempted: number
  passesCompleted: number
  progressivePasses: number
  carries: number
  progressiveCarries: number
  successfulDribbles: number
  tackles: number
  interceptions: number
  ballRecoveries: number
  pressures: number
}

export interface PlayerRawSeasonStats {
  readonly playerId: number
  readonly teamId: number
  readonly position: string | null
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
  progressivePasses: number
  carries: number
  progressiveCarries: number
  successfulDribbles: number
  tackles: number
  interceptions: number
  ballRecoveries: number
  pressures: number
}

export interface PlayerPer90Stats {
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

// A pass is progressive if it advances the ball >= 32 units forward (≈30 yards).
// StatsBomb pitches are 120×80; x increases toward the opponent's goal.
function isProgressive(startX: number, endX: number): boolean {
  return endX - startX >= 32
}

function emptyStats(
  playerId: number,
  playerName: string,
  teamId: number,
  teamName: string,
  position: string | null,
): RawPlayerMatchStats {
  return {
    playerId,
    playerName,
    teamId,
    teamName,
    position,
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
}

function getOrCreate(
  map: Map<number, RawPlayerMatchStats>,
  event: SbEvent,
): RawPlayerMatchStats {
  const { player, team, position } = event
  if (!player) throw new Error('Event has no player')
  let entry = map.get(player.id)
  if (!entry) {
    entry = emptyStats(
      player.id,
      player.name,
      team.id,
      team.name,
      position?.name ?? null,
    )
    map.set(player.id, entry)
  }
  return entry
}

/**
 * Parse all events from a single match into per-player raw stat counts.
 * Pure function — no DB or network access.
 */
export function parseMatchEvents(
  events: ReadonlyArray<SbEvent>,
): Map<number, RawPlayerMatchStats> {
  const stats = new Map<number, RawPlayerMatchStats>()

  for (const event of events) {
    if (!event.player) continue

    const typeName = event.type.name
    const s = getOrCreate(stats, event)

    if (typeName === 'Shot' && event.shot) {
      const { shot } = event
      s.shots++
      s.xG += shot.statsbomb_xg
      const outcomeName = shot.outcome.name
      if (outcomeName === 'Goal') {
        s.goals++
        s.shotsOnTarget++
      } else if (outcomeName === 'Saved') {
        s.shotsOnTarget++
      }
    } else if (typeName === 'Pass' && event.pass) {
      const { pass } = event
      const startX = event.location?.[0] ?? 0
      const endX = pass.end_location[0]
      s.passesAttempted++
      if (!pass.outcome) {
        // No outcome = completed
        s.passesCompleted++
      }
      if (pass.goal_assist) s.assists++
      if (pass.shot_assist || pass.goal_assist) s.keyPasses++
      if (pass.xa != null) s.xA += pass.xa
      if (isProgressive(startX, endX)) s.progressivePasses++
    } else if (typeName === 'Carry' && event.carry) {
      const startX = event.location?.[0] ?? 0
      const endX = event.carry.end_location[0]
      s.carries++
      if (isProgressive(startX, endX)) s.progressiveCarries++
    } else if (typeName === 'Dribble' && event.dribble) {
      if (event.dribble.outcome.name === 'Complete') s.successfulDribbles++
    } else if (typeName === 'Duel' && event.duel) {
      if (event.duel.type.name === 'Tackle') s.tackles++
    } else if (typeName === 'Interception') {
      s.interceptions++
    } else if (typeName === 'Ball Recovery') {
      s.ballRecoveries++
    } else if (typeName === 'Pressure') {
      s.pressures++
    }
  }

  return stats
}

/**
 * Effect-wrapped version of parseMatchEvents for use in ingestion pipelines.
 */
export const aggregateMatchEvents = (
  events: ReadonlyArray<SbEvent>,
): Effect.Effect<Map<number, RawPlayerMatchStats>> =>
  Effect.sync(() => parseMatchEvents(events))

/**
 * Compute per-90 normalised values from accumulated raw season stats.
 * passCompletionPct is a ratio, not divided by minutes.
 */
export function computePer90(raw: PlayerRawSeasonStats): PlayerPer90Stats {
  const factor = raw.minutes > 0 ? 90 / raw.minutes : 0
  const p90 = (n: number) => n * factor
  return {
    goals: p90(raw.goals),
    assists: p90(raw.assists),
    xG: p90(raw.xG),
    xA: p90(raw.xA),
    shots: p90(raw.shots),
    shotsOnTarget: p90(raw.shotsOnTarget),
    keyPasses: p90(raw.keyPasses),
    passesAttempted: p90(raw.passesAttempted),
    passesCompleted: p90(raw.passesCompleted),
    passCompletionPct:
      raw.passesAttempted > 0
        ? (raw.passesCompleted / raw.passesAttempted) * 100
        : 0,
    progressivePasses: p90(raw.progressivePasses),
    carries: p90(raw.carries),
    progressiveCarries: p90(raw.progressiveCarries),
    successfulDribbles: p90(raw.successfulDribbles),
    tackles: p90(raw.tackles),
    interceptions: p90(raw.interceptions),
    ballRecoveries: p90(raw.ballRecoveries),
    pressures: p90(raw.pressures),
  }
}

/**
 * Accumulate per-match stats into a season total, keyed by playerId.
 * Minutes and appearances must be supplied externally (computed from lineups/subs).
 */
export function accumulateSeasonStats(
  allMatchStats: ReadonlyArray<
    Map<number, RawPlayerMatchStats> & { minutesMap: Map<number, number> }
  >,
): Map<number, PlayerRawSeasonStats> {
  const season = new Map<number, PlayerRawSeasonStats>()

  for (const matchResult of allMatchStats) {
    const minutesMap = matchResult.minutesMap
    for (const [playerId, m] of matchResult) {
      let s = season.get(playerId)
      if (!s) {
        s = {
          playerId: m.playerId,
          teamId: m.teamId,
          position: m.position,
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
        season.set(playerId, s)
      }
      const mins = minutesMap.get(playerId) ?? 0
      s.minutes += mins
      s.appearances++
      s.goals += m.goals
      s.assists += m.assists
      s.xG += m.xG
      s.xA += m.xA
      s.shots += m.shots
      s.shotsOnTarget += m.shotsOnTarget
      s.keyPasses += m.keyPasses
      s.passesAttempted += m.passesAttempted
      s.passesCompleted += m.passesCompleted
      s.progressivePasses += m.progressivePasses
      s.carries += m.carries
      s.progressiveCarries += m.progressiveCarries
      s.successfulDribbles += m.successfulDribbles
      s.tackles += m.tackles
      s.interceptions += m.interceptions
      s.ballRecoveries += m.ballRecoveries
      s.pressures += m.pressures
    }
  }

  return season
}

/**
 * Compute per-player minutes from Starting XI and Substitution events.
 * Returns a map of playerId → minutes played for this match.
 */
export function computeMatchMinutes(
  events: ReadonlyArray<SbEvent>,
): Map<number, number> {
  const minutes = new Map<number, number>()
  // Track when each player started (minute they came on)
  const startedAt = new Map<number, number>()

  // Find the last minute in the match
  let lastMinute = 90
  for (const event of events) {
    if (event.type.name === 'Half End' && event.period >= 2) {
      lastMinute = Math.max(lastMinute, event.minute)
    }
  }

  // Process Starting XI events
  for (const event of events) {
    if (event.type.name === 'Starting XI' && event.tactics) {
      for (const lineupPlayer of event.tactics.lineup) {
        startedAt.set(lineupPlayer.player.id, 0)
      }
    }
  }

  // Process substitutions
  for (const event of events) {
    if (event.type.name === 'Substitution' && event.substitution && event.player) {
      const offId = event.player.id
      const onId = event.substitution.replacement.id
      const subMinute = event.minute

      // Player going off
      const startMin = startedAt.get(offId) ?? 0
      minutes.set(offId, subMinute - startMin)
      startedAt.delete(offId)

      // Player coming on
      startedAt.set(onId, subMinute)
    }
  }

  // All remaining players played to end of match
  for (const [playerId, startMin] of startedAt) {
    minutes.set(playerId, lastMinute - startMin)
  }

  return minutes
}

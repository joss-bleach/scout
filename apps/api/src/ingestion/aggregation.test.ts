import { describe, it, expect } from 'vitest'
import { parseMatchEvents, computePer90, computeMatchMinutes } from './aggregation.js'
import type { SbEvent } from './types.js'

const PLAYER_ID = 10
const PLAYER_NAME = 'Harry Kane'
const TEAM_ID = 1
const TEAM_NAME = 'Tottenham Hotspur'

function makeEvent(
  overrides: Partial<SbEvent> & { type: SbEvent['type'] },
): SbEvent {
  return {
    id: crypto.randomUUID(),
    index: 1,
    period: 1,
    timestamp: '00:00:00.000',
    minute: 0,
    second: 0,
    team: { id: TEAM_ID, name: TEAM_NAME },
    ...overrides,
  }
}

function makePlayerEvent(
  overrides: Partial<SbEvent> & { type: SbEvent['type'] },
): SbEvent {
  return makeEvent({
    player: { id: PLAYER_ID, name: PLAYER_NAME },
    position: { id: 23, name: 'Center Forward' },
    ...overrides,
  })
}

// Full fixture: player 10 plays 90 minutes in a match
function buildFixtureEvents(): SbEvent[] {
  const events: SbEvent[] = []

  // Starting XI for home team (includes player 10)
  events.push(
    makeEvent({
      type: { id: 35, name: 'Starting XI' },
      minute: 0,
      period: 1,
      tactics: {
        lineup: [
          {
            player: { id: PLAYER_ID, name: PLAYER_NAME },
            position: { id: 23, name: 'Center Forward' },
          },
        ],
      },
    }),
  )

  // Shot 1: Goal, xG = 0.5 → goals=1, shots=1, shotsOnTarget=1, xG=0.5
  events.push(
    makePlayerEvent({
      type: { id: 16, name: 'Shot' },
      minute: 12,
      location: [105, 40],
      shot: {
        statsbomb_xg: 0.5,
        outcome: { id: 97, name: 'Goal' },
        type: { id: 87, name: 'Open Play' },
      },
    }),
  )

  // Shot 2: Saved, xG = 0.3 → shotsOnTarget=2, shots=2, xG=0.8
  events.push(
    makePlayerEvent({
      type: { id: 16, name: 'Shot' },
      minute: 34,
      location: [108, 38],
      shot: {
        statsbomb_xg: 0.3,
        outcome: { id: 100, name: 'Saved' },
        type: { id: 87, name: 'Open Play' },
      },
    }),
  )

  // Shot 3: Off Target, xG = 0.1 → shots=3, xG=0.9
  events.push(
    makePlayerEvent({
      type: { id: 16, name: 'Shot' },
      minute: 58,
      location: [110, 35],
      shot: {
        statsbomb_xg: 0.1,
        outcome: { id: 98, name: 'Off T' },
        type: { id: 87, name: 'Open Play' },
      },
    }),
  )

  // Pass 1: Goal assist, xa = 0.5 → assists=1, keyPasses=1, xA=0.5, passAtt=1, passComp=1
  events.push(
    makePlayerEvent({
      type: { id: 30, name: 'Pass' },
      minute: 20,
      location: [85, 50],
      pass: {
        length: 15,
        end_location: [105, 40],
        goal_assist: true,
        shot_assist: true,
        xa: 0.5,
      },
    }),
  )

  // Pass 2: Key pass (shot_assist), xa = 0.2 → keyPasses=2, xA=0.7, passAtt=2, passComp=2
  events.push(
    makePlayerEvent({
      type: { id: 30, name: 'Pass' },
      minute: 55,
      location: [90, 35],
      pass: {
        length: 12,
        end_location: [108, 38],
        shot_assist: true,
        xa: 0.2,
      },
    }),
  )

  // Passes 3 & 4: Progressive (end_x - start_x >= 32) → progressivePasses=2, passAtt=4, passComp=4
  for (let i = 0; i < 2; i++) {
    events.push(
      makePlayerEvent({
        type: { id: 30, name: 'Pass' },
        minute: 30 + i * 5,
        location: [20, 40],
        pass: {
          length: 35,
          end_location: [55, 40],
        },
      }),
    )
  }

  // Passes 5-8: Regular completed passes → passAtt=8, passComp=8
  for (let i = 0; i < 4; i++) {
    events.push(
      makePlayerEvent({
        type: { id: 30, name: 'Pass' },
        minute: 40 + i * 2,
        location: [50, 40],
        pass: {
          length: 10,
          end_location: [60, 40],
        },
      }),
    )
  }

  // Passes 9-10: Incomplete → passAtt=10, passComp=8, passCompletionPct=80%
  for (let i = 0; i < 2; i++) {
    events.push(
      makePlayerEvent({
        type: { id: 30, name: 'Pass' },
        minute: 70 + i * 3,
        location: [50, 40],
        pass: {
          length: 20,
          end_location: [70, 40],
          outcome: { id: 9, name: 'Incomplete' },
        },
      }),
    )
  }

  // Carries 1-3: Progressive (end_x - start_x >= 32) → carries=3, progressiveCarries=3
  for (let i = 0; i < 3; i++) {
    events.push(
      makePlayerEvent({
        type: { id: 43, name: 'Carry' },
        minute: 25 + i * 10,
        location: [30, 40],
        carry: { end_location: [65, 40] },
      }),
    )
  }

  // Carries 4-5: Non-progressive → carries=5, progressiveCarries=3
  for (let i = 0; i < 2; i++) {
    events.push(
      makePlayerEvent({
        type: { id: 43, name: 'Carry' },
        minute: 60 + i * 5,
        location: [30, 40],
        carry: { end_location: [50, 40] },
      }),
    )
  }

  // Dribble 1: Complete → successfulDribbles=1
  events.push(
    makePlayerEvent({
      type: { id: 14, name: 'Dribble' },
      minute: 35,
      dribble: { outcome: { id: 8, name: 'Complete' } },
    }),
  )

  // Dribble 2: Incomplete → successfulDribbles=1
  events.push(
    makePlayerEvent({
      type: { id: 14, name: 'Dribble' },
      minute: 65,
      dribble: { outcome: { id: 9, name: 'Incomplete' } },
    }),
  )

  // Duels 1-2: Tackles → tackles=2
  for (let i = 0; i < 2; i++) {
    events.push(
      makePlayerEvent({
        type: { id: 4, name: 'Duel' },
        minute: 15 + i * 20,
        duel: { type: { id: 11, name: 'Tackle' } },
      }),
    )
  }

  // Interception → interceptions=1
  events.push(
    makePlayerEvent({
      type: { id: 10, name: 'Interception' },
      minute: 42,
    }),
  )

  // Ball Recoveries × 3 → ballRecoveries=3
  for (let i = 0; i < 3; i++) {
    events.push(
      makePlayerEvent({
        type: { id: 2, name: 'Ball Recovery' },
        minute: 10 + i * 15,
      }),
    )
  }

  // Pressures × 5 → pressures=5
  for (let i = 0; i < 5; i++) {
    events.push(
      makePlayerEvent({
        type: { id: 17, name: 'Pressure' },
        minute: 5 + i * 18,
      }),
    )
  }

  // Half End period 2 at minute 90 (used for minutes calculation)
  events.push(
    makeEvent({
      type: { id: 34, name: 'Half End' },
      period: 2,
      minute: 90,
    }),
  )

  return events
}

describe('parseMatchEvents', () => {
  const events = buildFixtureEvents()
  const stats = parseMatchEvents(events)
  const p = stats.get(PLAYER_ID)

  it('returns stats for the player', () => {
    expect(p).toBeDefined()
  })

  it('counts goals correctly', () => {
    expect(p?.goals).toBe(1)
  })

  it('sums xG from all shots', () => {
    expect(p?.xG).toBeCloseTo(0.9, 5)
  })

  it('counts total shots', () => {
    expect(p?.shots).toBe(3)
  })

  it('counts shots on target (goals + saved)', () => {
    expect(p?.shotsOnTarget).toBe(2)
  })

  it('counts assists from goal_assist passes', () => {
    expect(p?.assists).toBe(1)
  })

  it('sums xA from passes with xa field', () => {
    expect(p?.xA).toBeCloseTo(0.7, 5)
  })

  it('counts key passes (shot_assist or goal_assist)', () => {
    expect(p?.keyPasses).toBe(2)
  })

  it('counts passes attempted', () => {
    expect(p?.passesAttempted).toBe(10)
  })

  it('counts passes completed (no outcome = complete)', () => {
    expect(p?.passesCompleted).toBe(8)
  })

  it('counts progressive passes (end_x - start_x >= 32)', () => {
    expect(p?.progressivePasses).toBe(2)
  })

  it('counts carries', () => {
    expect(p?.carries).toBe(5)
  })

  it('counts progressive carries (end_x - start_x >= 32)', () => {
    expect(p?.progressiveCarries).toBe(3)
  })

  it('counts successful dribbles', () => {
    expect(p?.successfulDribbles).toBe(1)
  })

  it('counts tackles from Duel events with type Tackle', () => {
    expect(p?.tackles).toBe(2)
  })

  it('counts interceptions', () => {
    expect(p?.interceptions).toBe(1)
  })

  it('counts ball recoveries', () => {
    expect(p?.ballRecoveries).toBe(3)
  })

  it('counts pressures', () => {
    expect(p?.pressures).toBe(5)
  })

  it('records the player name, team, and position', () => {
    expect(p?.playerName).toBe(PLAYER_NAME)
    expect(p?.teamId).toBe(TEAM_ID)
    expect(p?.position).toBe('Center Forward')
  })
})

describe('computePer90', () => {
  it('returns raw values unchanged when minutes = 90', () => {
    const raw = {
      playerId: PLAYER_ID,
      teamId: TEAM_ID,
      position: 'Center Forward' as string | null,
      minutes: 90,
      appearances: 1,
      goals: 1,
      assists: 1,
      xG: 0.9,
      xA: 0.7,
      shots: 3,
      shotsOnTarget: 2,
      keyPasses: 2,
      passesAttempted: 10,
      passesCompleted: 8,
      progressivePasses: 2,
      carries: 5,
      progressiveCarries: 3,
      successfulDribbles: 1,
      tackles: 2,
      interceptions: 1,
      ballRecoveries: 3,
      pressures: 5,
    }
    const p90 = computePer90(raw)
    expect(p90.goals).toBeCloseTo(1.0, 5)
    expect(p90.xG).toBeCloseTo(0.9, 5)
    expect(p90.assists).toBeCloseTo(1.0, 5)
    expect(p90.xA).toBeCloseTo(0.7, 5)
    expect(p90.shots).toBeCloseTo(3.0, 5)
    expect(p90.shotsOnTarget).toBeCloseTo(2.0, 5)
    expect(p90.keyPasses).toBeCloseTo(2.0, 5)
    expect(p90.progressivePasses).toBeCloseTo(2.0, 5)
    expect(p90.carries).toBeCloseTo(5.0, 5)
    expect(p90.progressiveCarries).toBeCloseTo(3.0, 5)
    expect(p90.successfulDribbles).toBeCloseTo(1.0, 5)
    expect(p90.tackles).toBeCloseTo(2.0, 5)
    expect(p90.interceptions).toBeCloseTo(1.0, 5)
    expect(p90.ballRecoveries).toBeCloseTo(3.0, 5)
    expect(p90.pressures).toBeCloseTo(5.0, 5)
  })

  it('doubles per-90 values when minutes = 45', () => {
    const raw = {
      playerId: PLAYER_ID,
      teamId: TEAM_ID,
      position: null,
      minutes: 45,
      appearances: 1,
      goals: 1,
      assists: 0,
      xG: 0.5,
      xA: 0,
      shots: 2,
      shotsOnTarget: 1,
      keyPasses: 1,
      passesAttempted: 5,
      passesCompleted: 4,
      progressivePasses: 1,
      carries: 3,
      progressiveCarries: 1,
      successfulDribbles: 0,
      tackles: 1,
      interceptions: 0,
      ballRecoveries: 2,
      pressures: 3,
    }
    const p90 = computePer90(raw)
    expect(p90.goals).toBeCloseTo(2.0, 5)
    expect(p90.xG).toBeCloseTo(1.0, 5)
    expect(p90.tackles).toBeCloseTo(2.0, 5)
    expect(p90.pressures).toBeCloseTo(6.0, 5)
    expect(p90.progressivePasses).toBeCloseTo(2.0, 5)
  })

  it('computes pass completion pct independently of minutes', () => {
    const raw = {
      playerId: PLAYER_ID,
      teamId: TEAM_ID,
      position: null,
      minutes: 45,
      appearances: 1,
      goals: 0,
      assists: 0,
      xG: 0,
      xA: 0,
      shots: 0,
      shotsOnTarget: 0,
      keyPasses: 0,
      passesAttempted: 10,
      passesCompleted: 8,
      progressivePasses: 0,
      carries: 0,
      progressiveCarries: 0,
      successfulDribbles: 0,
      tackles: 0,
      interceptions: 0,
      ballRecoveries: 0,
      pressures: 0,
    }
    const p90 = computePer90(raw)
    expect(p90.passCompletionPct).toBeCloseTo(80.0, 5)
  })

  it('returns zeros safely when minutes = 0', () => {
    const raw = {
      playerId: PLAYER_ID,
      teamId: TEAM_ID,
      position: null,
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
    const p90 = computePer90(raw)
    expect(p90.goals).toBe(0)
    expect(p90.xG).toBe(0)
    expect(p90.passCompletionPct).toBe(0)
  })
})

describe('full pipeline: fixture events → per-90 values', () => {
  it('produces exact per-90 values from 90-minute fixture', () => {
    const events = buildFixtureEvents()
    const stats = parseMatchEvents(events)
    const raw = stats.get(PLAYER_ID)
    expect(raw).toBeDefined()

    // Set minutes based on the Half End event at minute 90 and starting XI
    const p90 = computePer90({ ...raw!, minutes: 90, appearances: 1 })

    // Metrics asserted per-90 (minutes=90 so per-90 = raw)
    expect(p90.goals).toBeCloseTo(1.0, 5)
    expect(p90.xG).toBeCloseTo(0.9, 5)
    expect(p90.xA).toBeCloseTo(0.7, 5)
    expect(p90.progressivePasses).toBeCloseTo(2.0, 5)
    expect(p90.tackles).toBeCloseTo(2.0, 5)
    // Four additional metrics
    expect(p90.shots).toBeCloseTo(3.0, 5)
    expect(p90.shotsOnTarget).toBeCloseTo(2.0, 5)
    expect(p90.interceptions).toBeCloseTo(1.0, 5)
    expect(p90.ballRecoveries).toBeCloseTo(3.0, 5)
    expect(p90.pressures).toBeCloseTo(5.0, 5)
    expect(p90.passCompletionPct).toBeCloseTo(80.0, 5)
  })
})

describe('computeMatchMinutes', () => {
  function makeMinutesEvent(
    overrides: Partial<SbEvent> & { type: SbEvent['type'] },
  ): SbEvent {
    return {
      id: crypto.randomUUID(),
      index: 1,
      period: 1,
      timestamp: '00:00:00.000',
      minute: 0,
      second: 0,
      team: { id: TEAM_ID, name: TEAM_NAME },
      ...overrides,
    }
  }

  it('gives 90 minutes to a player who starts and plays the full match', () => {
    const events: SbEvent[] = [
      makeMinutesEvent({
        type: { id: 35, name: 'Starting XI' },
        minute: 0,
        period: 1,
        tactics: {
          lineup: [{ player: { id: PLAYER_ID, name: PLAYER_NAME }, position: { id: 23, name: 'CF' } }],
        },
      }),
      makeMinutesEvent({ type: { id: 34, name: 'Half End' }, period: 2, minute: 90 }),
    ]
    const minutes = computeMatchMinutes(events)
    expect(minutes.get(PLAYER_ID)).toBe(90)
  })

  it('gives extra time minutes to players who play through', () => {
    const events: SbEvent[] = [
      makeMinutesEvent({
        type: { id: 35, name: 'Starting XI' },
        minute: 0,
        period: 1,
        tactics: {
          lineup: [{ player: { id: PLAYER_ID, name: PLAYER_NAME }, position: { id: 23, name: 'CF' } }],
        },
      }),
      makeMinutesEvent({ type: { id: 34, name: 'Half End' }, period: 2, minute: 95 }),
    ]
    const minutes = computeMatchMinutes(events)
    expect(minutes.get(PLAYER_ID)).toBe(95)
  })

  it('credits sub-on player with time from substitution minute to end', () => {
    const SUB_ID = 99
    const OFF_ID = PLAYER_ID
    const events: SbEvent[] = [
      makeMinutesEvent({
        type: { id: 35, name: 'Starting XI' },
        minute: 0,
        period: 1,
        tactics: {
          lineup: [{ player: { id: OFF_ID, name: PLAYER_NAME }, position: { id: 23, name: 'CF' } }],
        },
      }),
      makeMinutesEvent({
        type: { id: 19, name: 'Substitution' },
        minute: 60,
        period: 2,
        player: { id: OFF_ID, name: PLAYER_NAME },
        substitution: {
          replacement: { id: SUB_ID, name: 'Sub Player' },
          outcome: { id: 1, name: 'Tactical' },
        },
      }),
      makeMinutesEvent({ type: { id: 34, name: 'Half End' }, period: 2, minute: 90 }),
    ]
    const minutes = computeMatchMinutes(events)
    expect(minutes.get(OFF_ID)).toBe(60)
    expect(minutes.get(SUB_ID)).toBe(30)
  })

  it('returns empty map when no lineup events exist', () => {
    const events: SbEvent[] = [
      makeMinutesEvent({ type: { id: 34, name: 'Half End' }, period: 2, minute: 90 }),
    ]
    const minutes = computeMatchMinutes(events)
    expect(minutes.size).toBe(0)
  })
})

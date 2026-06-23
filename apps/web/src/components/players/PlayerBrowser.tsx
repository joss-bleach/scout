import { useState, useEffect, useMemo } from 'react'
import * as stylex from '@stylexjs/stylex'
import { colors, fonts, spacing } from '../../tokens.stylex.js'
import { PlayerFilters } from './PlayerFilters.js'
import { PlayerTable, COLUMNS } from './PlayerTable.js'
import { CompareBar } from './CompareBar.js'

export type PlayerRow = {
  readonly playerId: number
  readonly name: string
  readonly teamName: string
  readonly position: string | null
  readonly minutes: number
  readonly xGPer90: number
  readonly xAPer90: number
  readonly goalsPer90: number
  readonly keyPassesPer90: number
  readonly tacklesPer90: number
}

export type SortColumn = (typeof COLUMNS)[number]['key']
export type SortDir = 'ascending' | 'descending'

const MAX_SELECTED = 2

type UrlState = {
  position: string
  team: string
  minMinutes: string
  sortCol: SortColumn
  sortDir: SortDir
}

function isSortColumn(value: string | null): value is SortColumn {
  return value !== null && COLUMNS.some((c) => c.key === value)
}

function isSortDir(value: string | null): value is SortDir {
  return value === 'ascending' || value === 'descending'
}

function readUrlState(): UrlState {
  if (typeof window === 'undefined') {
    return { position: '', team: '', minMinutes: '', sortCol: 'name', sortDir: 'ascending' }
  }
  const p = new URLSearchParams(window.location.search)
  const sort = p.get('sort')
  const order = p.get('order')
  return {
    position: p.get('position') ?? '',
    team: p.get('team') ?? '',
    minMinutes: p.get('minMinutes') ?? '',
    sortCol: isSortColumn(sort) ? sort : 'name',
    sortDir: isSortDir(order) ? order : 'ascending',
  }
}

function writeUrlState(state: UrlState) {
  if (typeof window === 'undefined') return
  const p = new URLSearchParams()
  if (state.position) p.set('position', state.position)
  if (state.team) p.set('team', state.team)
  if (state.minMinutes) p.set('minMinutes', state.minMinutes)
  if (state.sortCol !== 'name') p.set('sort', state.sortCol)
  if (state.sortDir !== 'ascending') p.set('order', state.sortDir)
  const search = p.toString()
  window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname)
}

function comparePlayers(a: PlayerRow, b: PlayerRow, col: SortColumn): number {
  const av = a[col]
  const bv = b[col]
  if (av === bv) return 0
  if (av === null) return -1
  if (bv === null) return 1
  if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv)
  if (typeof av === 'number' && typeof bv === 'number') return av - bv
  return 0
}

const styles = stylex.create({
  container: {
    padding: spacing.s6,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: '24px',
    fontWeight: 700,
    color: colors.textPrimary,
    marginBottom: spacing.s5,
  },
  status: {
    padding: spacing.s12,
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  error: {
    padding: spacing.s6,
    color: colors.live,
    fontFamily: fonts.body,
    fontSize: '14px',
  },
})

export function PlayerBrowser() {
  const [allPlayers, setAllPlayers] = useState<readonly PlayerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initial = useMemo(readUrlState, [])
  const [position, setPosition] = useState(initial.position)
  const [team, setTeam] = useState(initial.team)
  const [minMinutes, setMinMinutes] = useState(initial.minMinutes)
  const [sortCol, setSortCol] = useState<SortColumn>(initial.sortCol)
  const [sortDir, setSortDir] = useState<SortDir>(initial.sortDir)
  const [selectedIds, setSelectedIds] = useState<readonly number[]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/players')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ players: PlayerRow[] }>
      })
      .then(({ players }) => {
        if (cancelled) return
        setAllPlayers(players)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load players')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    writeUrlState({ position, team, minMinutes, sortCol, sortDir })
  }, [position, team, minMinutes, sortCol, sortDir])

  const positions = useMemo(() => {
    const seen = new Set<string>()
    for (const p of allPlayers) {
      if (p.position) seen.add(p.position)
    }
    return Array.from(seen).sort()
  }, [allPlayers])

  const teams = useMemo(() => {
    const seen = new Set<string>()
    for (const p of allPlayers) seen.add(p.teamName)
    return Array.from(seen).sort()
  }, [allPlayers])

  const filtered = useMemo(() => {
    const min = Number.parseInt(minMinutes, 10)
    const hasMin = Number.isFinite(min) && min > 0
    return allPlayers.filter((r) => {
      if (position && r.position !== position) return false
      if (team && r.teamName !== team) return false
      if (hasMin && r.minutes < min) return false
      return true
    })
  }, [allPlayers, position, team, minMinutes])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const cmp = comparePlayers(a, b, sortCol)
      return sortDir === 'descending' ? -cmp : cmp
    })
    return copy
  }, [filtered, sortCol, sortDir])

  function handleHeaderClick(col: SortColumn) {
    if (col === sortCol) {
      setSortDir((d) => (d === 'descending' ? 'ascending' : 'descending'))
    } else {
      setSortCol(col)
      setSortDir('descending')
    }
  }

  function handleSelect(id: number) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, id]
    })
  }

  if (loading) {
    return <div {...stylex.props(styles.status)}>Loading players…</div>
  }

  if (error) {
    return <div {...stylex.props(styles.error)}>Error: {error}</div>
  }

  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.heading)}>Player Browser</h1>

      <PlayerFilters
        positions={positions}
        teams={teams}
        position={position}
        team={team}
        minMinutes={minMinutes}
        onPositionChange={setPosition}
        onTeamChange={setTeam}
        onMinMinutesChange={setMinMinutes}
      />

      <PlayerTable
        players={sorted}
        sortCol={sortCol}
        sortDir={sortDir}
        selectedIds={selectedIds}
        canSelectMore={selectedIds.length < MAX_SELECTED}
        onHeaderClick={handleHeaderClick}
        onSelect={handleSelect}
      />

      {selectedIds.length === MAX_SELECTED && <CompareBar selectedIds={selectedIds} />}
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import * as stylex from '@stylexjs/stylex'
import { colors, fonts, spacing, rounded, shadow } from '../../tokens.stylex.js'

export type PlayerRow = {
  playerId: number
  name: string
  teamName: string
  position: string | null
  minutes: number
  xGPer90: number
  xAPer90: number
  goalsPer90: number
  keyPassesPer90: number
  tacklesPer90: number
}

type SortColumn = 'name' | 'teamName' | 'position' | 'minutes' | 'xGPer90' | 'xAPer90' | 'goalsPer90' | 'keyPassesPer90' | 'tacklesPer90'
type SortDir = 'ascending' | 'descending'

function readParams() {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  return {
    position: p.get('position') ?? '',
    team: p.get('team') ?? '',
    minMinutes: p.get('minMinutes') ?? '',
    sort: (p.get('sort') ?? '') as SortColumn | '',
    order: (p.get('order') ?? '') as SortDir | '',
  }
}

function pushParams(params: Record<string, string>) {
  if (typeof window === 'undefined') return
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) p.set(k, v)
  }
  const search = p.toString()
  window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname)
}

function fmt(n: number) {
  return n.toFixed(2)
}

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'name', label: 'Player' },
  { key: 'teamName', label: 'Team' },
  { key: 'position', label: 'Position' },
  { key: 'minutes', label: 'Mins' },
  { key: 'xGPer90', label: 'xG' },
  { key: 'xAPer90', label: 'xA' },
  { key: 'goalsPer90', label: 'Goals' },
  { key: 'keyPassesPer90', label: 'Key Passes' },
  { key: 'tacklesPer90', label: 'Tackles' },
]

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
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.s4,
    marginBottom: spacing.s5,
    alignItems: 'flex-end',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.s1,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: '12px',
    fontWeight: 600,
    color: colors.textSecondary,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  select: {
    height: '40px',
    paddingInline: spacing.s3,
    borderRadius: rounded.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '160px',
    ':focus-visible': {
      borderColor: colors.secondary,
      boxShadow: shadow.focus,
    },
  },
  numberInput: {
    height: '40px',
    paddingInline: spacing.s3,
    borderRadius: rounded.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: '14px',
    outline: 'none',
    width: '120px',
    ':focus-visible': {
      borderColor: colors.secondary,
      boxShadow: shadow.focus,
    },
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: rounded.lg,
    boxShadow: shadow.e1,
    border: `1px solid ${colors.borderSubtle}`,
    backgroundColor: colors.surface,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: fonts.body,
    fontSize: '14px',
  },
  th: {
    backgroundColor: colors.primary,
    color: colors.onDark,
    padding: `${spacing.s3} ${spacing.s4}`,
    textAlign: 'left',
    fontWeight: 700,
    letterSpacing: '0.04em',
    fontSize: '12px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ':hover': {
      backgroundColor: colors.inverse,
    },
  },
  thActive: {
    backgroundColor: colors.inverse,
    color: colors.secondary,
  },
  thCheckbox: {
    backgroundColor: colors.primary,
    padding: `${spacing.s3} ${spacing.s4}`,
    width: '40px',
  },
  tr: {
    borderBottom: `1px solid ${colors.borderSubtle}`,
    ':hover': {
      backgroundColor: colors.accentTint,
    },
  },
  trSelected: {
    backgroundColor: colors.accentTint,
  },
  td: {
    padding: `${spacing.s3} ${spacing.s4}`,
    color: colors.textPrimary,
    whiteSpace: 'nowrap',
  },
  tdMuted: {
    color: colors.textSecondary,
  },
  tdNumeric: {
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
  },
  sortIndicator: {
    marginLeft: spacing.s1,
    fontSize: '10px',
  },
  emptyState: {
    padding: spacing.s12,
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: '16px',
  },
  compareBar: {
    position: 'sticky',
    bottom: '0',
    backgroundColor: colors.primary,
    color: colors.onDark,
    padding: `${spacing.s4} ${spacing.s6}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.s4,
    boxShadow: shadow.e3,
  },
  compareText: {
    fontFamily: fonts.body,
    fontSize: '14px',
  },
  compareLink: {
    display: 'inline-flex',
    alignItems: 'center',
    height: '36px',
    paddingInline: spacing.s5,
    borderRadius: rounded.md,
    backgroundColor: colors.secondary,
    color: '#04263A',
    fontFamily: fonts.body,
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    ':hover': {
      backgroundColor: colors.accentHover,
      color: colors.onDark,
    },
  },
  loading: {
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
  const initial = readParams()
  const [allPlayers, setAllPlayers] = useState<PlayerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [position, setPosition] = useState(initial.position ?? '')
  const [team, setTeam] = useState(initial.team ?? '')
  const [minMinutes, setMinMinutes] = useState(initial.minMinutes ?? '')
  const [sortCol, setSortCol] = useState<SortColumn>(
    (initial.sort as SortColumn) || 'name'
  )
  const [sortDir, setSortDir] = useState<SortDir>(
    (initial.order as SortDir) || 'ascending'
  )
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    setLoading(true)
    fetch('/api/players')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ players: PlayerRow[] }>
      })
      .then(({ players }) => {
        setAllPlayers(players)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load players')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    pushParams({ position, team, minMinutes, sort: sortCol, order: sortDir })
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
    let rows = allPlayers
    if (position) rows = rows.filter((r) => r.position === position)
    if (team) rows = rows.filter((r) => r.teamName === team)
    const min = parseInt(minMinutes, 10)
    if (!isNaN(min) && min > 0) rows = rows.filter((r) => r.minutes >= min)
    return rows
  }, [allPlayers, position, team, minMinutes])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortCol]
      const bv = b[sortCol]
      const cmp =
        av === null ? -1
        : bv === null ? 1
        : typeof av === 'string' && typeof bv === 'string'
          ? av.localeCompare(bv)
          : (av as number) - (bv as number)
      return sortDir === 'descending' ? -cmp : cmp
    })
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
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  if (loading) {
    return <div {...stylex.props(styles.loading)}>Loading players…</div>
  }

  if (error) {
    return <div {...stylex.props(styles.error)}>Error: {error}</div>
  }

  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.heading)}>Player Browser</h1>

      <div {...stylex.props(styles.filters)}>
        <div {...stylex.props(styles.filterGroup)}>
          <label {...stylex.props(styles.label)} htmlFor="filter-position">
            Position
          </label>
          <select
            id="filter-position"
            aria-label="Position"
            {...stylex.props(styles.select)}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="">All positions</option>
            {positions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div {...stylex.props(styles.filterGroup)}>
          <label {...stylex.props(styles.label)} htmlFor="filter-team">
            Team
          </label>
          <select
            id="filter-team"
            aria-label="Team"
            {...stylex.props(styles.select)}
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          >
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div {...stylex.props(styles.filterGroup)}>
          <label {...stylex.props(styles.label)} htmlFor="filter-min-minutes">
            Min. Minutes
          </label>
          <input
            id="filter-min-minutes"
            aria-label="Min. Minutes"
            type="number"
            min={0}
            placeholder="e.g. 900"
            {...stylex.props(styles.numberInput)}
            value={minMinutes}
            onChange={(e) => setMinMinutes(e.target.value)}
          />
        </div>
      </div>

      <div {...stylex.props(styles.tableWrapper)}>
        <table {...stylex.props(styles.table)}>
          <thead>
            <tr>
              <th {...stylex.props(styles.thCheckbox)} />
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  role="columnheader"
                  aria-sort={sortCol === key ? sortDir : undefined}
                  {...stylex.props(styles.th, sortCol === key && styles.thActive)}
                  onClick={() => handleHeaderClick(key)}
                >
                  {label}
                  {sortCol === key && (
                    <span {...stylex.props(styles.sortIndicator)} aria-hidden>
                      {sortDir === 'descending' ? '▼' : '▲'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} {...stylex.props(styles.emptyState)}>
                  No players match the active filters
                </td>
              </tr>
            ) : (
              sorted.map((player) => {
                const selected = selectedIds.includes(player.playerId)
                return (
                  <tr
                    key={player.playerId}
                    {...stylex.props(styles.tr, selected && styles.trSelected)}
                  >
                    <td {...stylex.props(styles.td)}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${player.name}`}
                        checked={selected}
                        onChange={() => handleSelect(player.playerId)}
                        disabled={!selected && selectedIds.length >= 2}
                      />
                    </td>
                    <td {...stylex.props(styles.td)}>{player.name}</td>
                    <td {...stylex.props(styles.td, styles.tdMuted)}>{player.teamName}</td>
                    <td {...stylex.props(styles.td, styles.tdMuted)}>{player.position ?? '—'}</td>
                    <td {...stylex.props(styles.td, styles.tdNumeric)}>{player.minutes}</td>
                    <td {...stylex.props(styles.td, styles.tdNumeric)}>{fmt(player.xGPer90)}</td>
                    <td {...stylex.props(styles.td, styles.tdNumeric)}>{fmt(player.xAPer90)}</td>
                    <td {...stylex.props(styles.td, styles.tdNumeric)}>{fmt(player.goalsPer90)}</td>
                    <td {...stylex.props(styles.td, styles.tdNumeric)}>{fmt(player.keyPassesPer90)}</td>
                    <td {...stylex.props(styles.td, styles.tdNumeric)}>{fmt(player.tacklesPer90)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedIds.length === 2 && (
        <div {...stylex.props(styles.compareBar)}>
          <span {...stylex.props(styles.compareText)}>
            2 players selected
          </span>
          <a
            href={`/compare?ids=${selectedIds.join(',')}`}
            {...stylex.props(styles.compareLink)}
          >
            Compare players
          </a>
        </div>
      )}
    </div>
  )
}

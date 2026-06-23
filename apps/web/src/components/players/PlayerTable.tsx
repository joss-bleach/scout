import { type KeyboardEvent } from 'react'
import * as stylex from '@stylexjs/stylex'
import { colors, fonts, spacing, rounded, shadow } from '../../tokens.stylex.js'
import type { PlayerRow, SortColumn, SortDir } from './PlayerBrowser.js'

export const COLUMNS = [
  { key: 'name', label: 'Player', numeric: false },
  { key: 'teamName', label: 'Team', numeric: false },
  { key: 'position', label: 'Position', numeric: false },
  { key: 'minutes', label: 'Mins', numeric: true },
  { key: 'xGPer90', label: 'xG', numeric: true },
  { key: 'xAPer90', label: 'xA', numeric: true },
  { key: 'goalsPer90', label: 'Goals', numeric: true },
  { key: 'keyPassesPer90', label: 'Key Passes', numeric: true },
  { key: 'tacklesPer90', label: 'Tackles', numeric: true },
] as const satisfies readonly {
  key: keyof PlayerRow
  label: string
  numeric: boolean
}[]

const styles = stylex.create({
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
    outline: 'none',
    touchAction: 'manipulation',
    ':hover': {
      backgroundColor: colors.inverse,
    },
    ':focus-visible': {
      boxShadow: `inset 0 0 0 2px ${colors.secondary}`,
    },
  },
  thNumeric: {
    textAlign: 'right',
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
  checkboxCell: {
    padding: spacing.s2,
    cursor: 'pointer',
    display: 'block',
  },
})

function activateOnKey(e: KeyboardEvent<HTMLTableCellElement>, fn: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    fn()
  }
}

interface PlayerTableProps {
  readonly players: readonly PlayerRow[]
  readonly sortCol: SortColumn
  readonly sortDir: SortDir
  readonly selectedIds: readonly number[]
  readonly canSelectMore: boolean
  readonly onHeaderClick: (col: SortColumn) => void
  readonly onSelect: (id: number) => void
}

export function PlayerTable({
  players,
  sortCol,
  sortDir,
  selectedIds,
  canSelectMore,
  onHeaderClick,
  onSelect,
}: PlayerTableProps) {
  return (
    <div {...stylex.props(styles.tableWrapper)}>
      <table {...stylex.props(styles.table)}>
        <thead>
          <tr>
            <th {...stylex.props(styles.thCheckbox)} scope="col" />
            {COLUMNS.map(({ key, label, numeric }) => {
              const active = sortCol === key
              return (
                <th
                  key={key}
                  scope="col"
                  tabIndex={0}
                  aria-sort={active ? sortDir : 'none'}
                  {...stylex.props(
                    styles.th,
                    numeric && styles.thNumeric,
                    active && styles.thActive,
                  )}
                  onClick={() => onHeaderClick(key)}
                  onKeyDown={(e) => activateOnKey(e, () => onHeaderClick(key))}
                >
                  {label}
                  {active && (
                    <span {...stylex.props(styles.sortIndicator)} aria-hidden>
                      {sortDir === 'descending' ? '▼' : '▲'}
                    </span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {players.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length + 1} {...stylex.props(styles.emptyState)}>
                No players match the active filters
              </td>
            </tr>
          ) : (
            players.map((player) => {
              const selected = selectedIds.includes(player.playerId)
              return (
                <tr
                  key={player.playerId}
                  {...stylex.props(styles.tr, selected && styles.trSelected)}
                >
                  <td {...stylex.props(styles.td)}>
                    <label {...stylex.props(styles.checkboxCell)}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${player.name}`}
                        checked={selected}
                        onChange={() => onSelect(player.playerId)}
                        disabled={!selected && !canSelectMore}
                      />
                    </label>
                  </td>
                  <td {...stylex.props(styles.td)}>{player.name}</td>
                  <td {...stylex.props(styles.td, styles.tdMuted)}>{player.teamName}</td>
                  <td {...stylex.props(styles.td, styles.tdMuted)}>{player.position ?? '—'}</td>
                  <td {...stylex.props(styles.td, styles.tdNumeric)}>{player.minutes}</td>
                  <td {...stylex.props(styles.td, styles.tdNumeric)}>{player.xGPer90.toFixed(2)}</td>
                  <td {...stylex.props(styles.td, styles.tdNumeric)}>{player.xAPer90.toFixed(2)}</td>
                  <td {...stylex.props(styles.td, styles.tdNumeric)}>{player.goalsPer90.toFixed(2)}</td>
                  <td {...stylex.props(styles.td, styles.tdNumeric)}>{player.keyPassesPer90.toFixed(2)}</td>
                  <td {...stylex.props(styles.td, styles.tdNumeric)}>{player.tacklesPer90.toFixed(2)}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

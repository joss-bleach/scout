import * as stylex from '@stylexjs/stylex'
import { colors, fonts, spacing, rounded, shadow } from '../../tokens.stylex.js'

const styles = stylex.create({
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
  control: {
    height: '44px',
    paddingInline: spacing.s3,
    borderRadius: rounded.sm,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: '16px',
    outline: 'none',
    touchAction: 'manipulation',
    ':focus-visible': {
      borderColor: colors.secondary,
      boxShadow: shadow.focus,
    },
  },
  select: {
    cursor: 'pointer',
    minWidth: '160px',
  },
  numberInput: {
    width: '140px',
  },
})

interface PlayerFiltersProps {
  readonly positions: readonly string[]
  readonly teams: readonly string[]
  readonly position: string
  readonly team: string
  readonly minMinutes: string
  readonly onPositionChange: (value: string) => void
  readonly onTeamChange: (value: string) => void
  readonly onMinMinutesChange: (value: string) => void
}

export function PlayerFilters({
  positions,
  teams,
  position,
  team,
  minMinutes,
  onPositionChange,
  onTeamChange,
  onMinMinutesChange,
}: PlayerFiltersProps) {
  return (
    <div {...stylex.props(styles.filters)}>
      <div {...stylex.props(styles.filterGroup)}>
        <label {...stylex.props(styles.label)} htmlFor="filter-position">
          Position
        </label>
        <select
          id="filter-position"
          aria-label="Position"
          {...stylex.props(styles.control, styles.select)}
          value={position}
          onChange={(e) => onPositionChange(e.target.value)}
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
          {...stylex.props(styles.control, styles.select)}
          value={team}
          onChange={(e) => onTeamChange(e.target.value)}
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
          inputMode="numeric"
          min={0}
          placeholder="e.g. 900"
          {...stylex.props(styles.control, styles.numberInput)}
          value={minMinutes}
          onChange={(e) => onMinMinutesChange(e.target.value)}
        />
      </div>
    </div>
  )
}

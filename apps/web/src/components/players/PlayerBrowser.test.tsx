import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlayerBrowser } from './PlayerBrowser.js'
import type { PlayerRow } from './PlayerBrowser.js'

const PLAYERS: PlayerRow[] = [
  {
    playerId: 1,
    name: 'Harry Kane',
    teamName: 'Tottenham Hotspur',
    position: 'Center Forward',
    minutes: 3240,
    xGPer90: 0.72,
    xAPer90: 0.21,
    goalsPer90: 0.58,
    keyPassesPer90: 1.12,
    tacklesPer90: 0.18,
  },
  {
    playerId: 2,
    name: 'Dele Alli',
    teamName: 'Tottenham Hotspur',
    position: 'Attacking Midfield',
    minutes: 2700,
    xGPer90: 0.31,
    xAPer90: 0.42,
    goalsPer90: 0.30,
    keyPassesPer90: 2.10,
    tacklesPer90: 1.05,
  },
  {
    playerId: 3,
    name: 'N\'Golo Kanté',
    teamName: 'Chelsea',
    position: 'Defensive Midfield',
    minutes: 1800,
    xGPer90: 0.05,
    xAPer90: 0.08,
    goalsPer90: 0.05,
    keyPassesPer90: 0.60,
    tacklesPer90: 4.50,
  },
]

function setupFetch(players: PlayerRow[]) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ players }),
  }))
}

beforeEach(() => {
  vi.restoreAllMocks()
  window.history.replaceState(null, '', window.location.pathname)
})

describe('PlayerBrowser', () => {
  it('renders a row for each player returned by the API', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => {
      expect(screen.getByText('Harry Kane')).toBeTruthy()
      expect(screen.getByText('Dele Alli')).toBeTruthy()
      expect(screen.getByText("N'Golo Kanté")).toBeTruthy()
    })
  })

  it('displays per-90 metrics in each row', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => {
      expect(screen.getByText('0.72')).toBeTruthy()
    })
  })

  it('position filter narrows the displayed players', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => expect(screen.getByText('Harry Kane')).toBeTruthy())

    const positionSelect = screen.getByRole('combobox', { name: /position/i })
    fireEvent.change(positionSelect, { target: { value: 'Defensive Midfield' } })

    expect(screen.queryByText('Harry Kane')).toBeNull()
    expect(screen.queryByText('Dele Alli')).toBeNull()
    expect(screen.getByText("N'Golo Kanté")).toBeTruthy()
  })

  it('team filter narrows the displayed players', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => expect(screen.getByText('Harry Kane')).toBeTruthy())

    const teamSelect = screen.getByRole('combobox', { name: /team/i })
    fireEvent.change(teamSelect, { target: { value: 'Chelsea' } })

    expect(screen.queryByText('Harry Kane')).toBeNull()
    expect(screen.queryByText('Dele Alli')).toBeNull()
    expect(screen.getByText("N'Golo Kanté")).toBeTruthy()
  })

  it('minimum minutes filter excludes players below the threshold', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => expect(screen.getByText('Harry Kane')).toBeTruthy())

    const minMinutesInput = screen.getByRole('spinbutton', { name: /min.*minutes/i })
    fireEvent.change(minMinutesInput, { target: { value: '2000' } })

    expect(screen.queryByText("N'Golo Kanté")).toBeNull()
    expect(screen.getByText('Harry Kane')).toBeTruthy()
    expect(screen.getByText('Dele Alli')).toBeTruthy()
  })

  it('renders an empty state message when no players match the active filters', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => expect(screen.getByText('Harry Kane')).toBeTruthy())

    const minMinutesInput = screen.getByRole('spinbutton', { name: /min.*minutes/i })
    fireEvent.change(minMinutesInput, { target: { value: '9999' } })

    expect(screen.getByText(/no players/i)).toBeTruthy()
  })

  it('clicking a column header sorts players by that metric', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => expect(screen.getByText('Harry Kane')).toBeTruthy())

    const xGHeader = screen.getByRole('columnheader', { name: /xg/i })
    fireEvent.click(xGHeader)

    const rows = screen.getAllByRole('row')
    const rowTexts = rows.slice(1).map((r) => r.textContent ?? '')
    expect(rowTexts[0]).toContain('Harry Kane')
  })

  it('clicking an active sort column toggles the sort direction', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => expect(screen.getByText('Harry Kane')).toBeTruthy())

    const xGHeader = screen.getByRole('columnheader', { name: /xg/i })
    fireEvent.click(xGHeader)
    fireEvent.click(xGHeader)

    const rows = screen.getAllByRole('row')
    const rowTexts = rows.slice(1).map((r) => r.textContent ?? '')
    expect(rowTexts[0]).toContain("N'Golo Kanté")
  })

  it('active sort column header has an aria-sort attribute', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => expect(screen.getByText('Harry Kane')).toBeTruthy())

    const xGHeader = screen.getByRole('columnheader', { name: /xg/i })
    fireEvent.click(xGHeader)

    expect(xGHeader.getAttribute('aria-sort')).toBe('descending')
  })

  it('selecting two players shows the Compare CTA', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => expect(screen.getByText('Harry Kane')).toBeTruthy())

    const [cb0, cb1] = screen.getAllByRole('checkbox')
    fireEvent.click(cb0!)
    fireEvent.click(cb1!)

    expect(screen.getByRole('link', { name: /compare/i })).toBeTruthy()
  })

  it('cannot select more than two players', async () => {
    setupFetch(PLAYERS)
    render(<PlayerBrowser />)
    await waitFor(() => expect(screen.getByText('Harry Kane')).toBeTruthy())

    const [cb0, cb1, cb2] = screen.getAllByRole('checkbox')
    fireEvent.click(cb0!)
    fireEvent.click(cb1!)
    fireEvent.click(cb2!)

    const checkedBoxes = screen.getAllByRole('checkbox').filter((cb) => (cb as HTMLInputElement).checked)
    expect(checkedBoxes).toHaveLength(2)
  })
})

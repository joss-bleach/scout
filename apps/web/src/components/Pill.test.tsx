import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Pill } from './Pill.js'

describe('Pill', () => {
  it('renders with default tag variant', () => {
    render(<Pill>LIVE</Pill>)
    expect(screen.getByText('LIVE')).toBeTruthy()
  })

  it.each(['live', 'tag'] as const)('renders %s variant without error', (variant) => {
    render(<Pill variant={variant}>{variant}</Pill>)
    expect(screen.getByText(variant)).toBeTruthy()
  })

  it('forwards additional props', () => {
    render(<Pill data-testid="badge">Tag</Pill>)
    expect(screen.getByTestId('badge')).toBeTruthy()
  })
})

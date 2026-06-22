import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card.js'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeTruthy()
  })

  it('renders without error', () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId('card')).toBeTruthy()
  })

  it('forwards additional props', () => {
    render(<Card data-testid="card" aria-label="player card">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.getAttribute('aria-label')).toBe('player card')
  })
})

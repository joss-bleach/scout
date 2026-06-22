import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer.js'

describe('Footer', () => {
  it('renders a contentinfo landmark', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })

  it('includes StatsBomb attribution text', () => {
    render(<Footer />)
    expect(screen.getByText(/StatsBomb/)).toBeTruthy()
  })

  it('includes a link to the StatsBomb licence', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /StatsBomb/ })).toBeTruthy()
  })

  it('StatsBomb link opens in a new tab', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /StatsBomb/ })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })
})

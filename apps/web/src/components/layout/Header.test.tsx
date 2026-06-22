import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header.js'

describe('Header', () => {
  it('renders a banner landmark', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeTruthy()
  })

  it('contains the Scout brand link', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Scout' })).toBeTruthy()
  })

  it('contains accessible navigation', () => {
    render(<Header />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeTruthy()
  })

  it('brand link is keyboard focusable', () => {
    render(<Header />)
    const link = screen.getByRole('link', { name: 'Scout' })
    link.focus()
    expect(document.activeElement).toBe(link)
  })
})

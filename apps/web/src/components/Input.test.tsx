import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './Input.js'

describe('Input', () => {
  it('renders as a text input', () => {
    render(<Input aria-label="Search" />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeTruthy()
  })

  it('is keyboard focusable', () => {
    render(<Input aria-label="Search" />)
    const input = screen.getByRole('textbox')
    input.focus()
    expect(document.activeElement).toBe(input)
  })

  it('renders placeholder text', () => {
    render(<Input placeholder="Search players..." aria-label="Search" />)
    expect(screen.getByPlaceholderText('Search players...')).toBeTruthy()
  })

  it('forwards additional props', () => {
    render(<Input aria-label="Search" data-testid="search-input" />)
    expect(screen.getByTestId('search-input')).toBeTruthy()
  })
})

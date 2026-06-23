import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App.js'

describe('App', () => {
  it('renders main content area', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeTruthy()
  })

  it('renders the navigation header', () => {
    render(<App />)
    expect(screen.getByRole('banner')).toBeTruthy()
  })

  it('renders the footer with StatsBomb attribution', () => {
    render(<App />)
    expect(screen.getByRole('contentinfo')).toBeTruthy()
    expect(screen.getByText(/StatsBomb/)).toBeTruthy()
  })
})

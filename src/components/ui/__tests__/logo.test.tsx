import React from 'react'
import { render, screen } from '@testing-library/react'
import { Logo } from '../Logo'

describe('Logo Component', () => {
  it('renders with default size', () => {
    render(<Logo />)
    const logo = screen.getByTestId('logo-container')
    expect(logo).toBeInTheDocument()
    // Default horizontal md size is now w-44 h-12, but we test the icon size which is w-10 h-10
    expect(logo).toContainHTML('w-10 h-10')
  })

  it('renders with custom size', () => {
    render(<Logo size="lg" />)
    const logo = screen.getByTestId('logo-container')
    // Large size icon within horizontal layout is w-14 h-14
    expect(logo).toContainHTML('w-14 h-14')
  })

  it('renders with custom size small', () => {
    render(<Logo size="sm" />)
    const logo = screen.getByTestId('logo-container')
    // Small size icon within horizontal layout is w-8 h-8
    expect(logo).toContainHTML('w-8 h-8')
  })

  it('renders with custom className', () => {
    render(<Logo className="custom-logo" />)
    const logo = screen.getByTestId('logo-container')
    expect(logo).toHaveClass('custom-logo')
  })

  it('renders with default size when no size specified', () => {
    render(<Logo />)
    const logo = screen.getByTestId('logo-container')
    // Default is horizontal md with icon size w-10 h-10
    expect(logo).toContainHTML('w-10 h-10')
  })

  it('renders SVG icon', () => {
    render(<Logo />)
    const svg = screen.getByTestId('logo-svg')
    expect(svg).toBeInTheDocument()
    expect(svg.tagName).toBe('svg')
  })

  it('applies correct background and styling', () => {
    render(<Logo />)
    const logo = screen.getByTestId('logo-container')
    expect(logo).toHaveClass('bg-primary-600', 'rounded-lg', 'flex', 'items-center', 'justify-center', 'overflow-hidden', 'shadow-sm')
  })

  it('renders with all props combined', () => {
    render(
      <Logo 
        size="lg"
        className="combined-logo"
      />
    )
    const logo = screen.getByTestId('logo-container')
    expect(logo).toHaveClass('combined-logo')
    expect(logo).toContainHTML('w-14 h-14')
  })
})

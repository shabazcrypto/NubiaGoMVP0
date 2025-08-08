// ============================================================================
// OPTIMIZED IMAGE COMPONENT TESTS
// ============================================================================

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { OptimizedImage, ResponsiveImage, BackgroundImage } from '../optimized-image'

// Mock the performance utility
jest.mock('@/lib/performance', () => ({
  ImageOptimization: {
    getOptimizedImageUrl: jest.fn((url, width, quality) => `${url}?w=${width}&q=${quality}`),
    createLazyImageLoader: jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
    })),
  },
}))

describe('OptimizedImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should render image with correct attributes', () => {
      render(<OptimizedImage {...defaultProps} />)
      
      const img = screen.getByAltText('Test image')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('alt', 'Test image')
    })

    it('should apply default width and height', () => {
      render(<OptimizedImage {...defaultProps} />)
      
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('width', '800')
      expect(img).toHaveAttribute('height', '600')
    })

    it('should apply custom width and height', () => {
      render(<OptimizedImage {...defaultProps} width={400} height={300} />)
      
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('width', '400')
      expect(img).toHaveAttribute('height', '300')
    })

    it('should apply custom className', () => {
      render(<OptimizedImage {...defaultProps} className="custom-class" />)
      
      const img = screen.getByAltText('Test image')
      expect(img).toHaveClass('custom-class')
    })
  })

  describe('lazy loading', () => {
    it('should enable lazy loading by default', () => {
      render(<OptimizedImage {...defaultProps} />)
      
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).toHaveClass('lazy')
    })

    it('should disable lazy loading when priority is true', () => {
      render(<OptimizedImage {...defaultProps} priority={true} />)
      
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('loading', 'eager')
      expect(img).not.toHaveClass('lazy')
    })

    it('should disable lazy loading when lazy is false', () => {
      render(<OptimizedImage {...defaultProps} lazy={false} />)
      
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('loading', 'eager')
      expect(img).not.toHaveClass('lazy')
    })
  })

  describe('error handling', () => {
    it('should show fallback image on error', async () => {
      render(<OptimizedImage {...defaultProps} fallback="/fallback.jpg" />)
      
      const img = screen.getByAltText('Test image')
      
      // Simulate image error
      fireEvent.error(img)
      
      await waitFor(() => {
        expect(img).toHaveAttribute('src', '/fallback.jpg')
      })
    })

    it('should show error state when image fails to load', async () => {
      render(<OptimizedImage {...defaultProps} />)
      
      const img = screen.getByAltText('Test image')
      
      // Simulate image error
      fireEvent.error(img)
      
      await waitFor(() => {
        expect(screen.getByText('Image unavailable')).toBeInTheDocument()
      })
    })
  })

  describe('loading state', () => {
    it('should show loading placeholder initially', () => {
      render(<OptimizedImage {...defaultProps} />)
      
      const placeholder = document.querySelector('.animate-pulse')
      expect(placeholder).toBeInTheDocument()
    })

    it('should hide loading placeholder when image loads', async () => {
      render(<OptimizedImage {...defaultProps} />)
      
      const img = screen.getByAltText('Test image')
      
      // Simulate image load
      fireEvent.load(img)
      
      await waitFor(() => {
        const placeholder = document.querySelector('.animate-pulse')
        expect(placeholder).not.toBeInTheDocument()
      })
    })
  })

  describe('image optimization', () => {
    it('should generate optimized image URL', () => {
      const { ImageOptimization } = require('@/lib/performance')
      
      render(<OptimizedImage {...defaultProps} width={400} quality={80} />)
      
      expect(ImageOptimization.getOptimizedImageUrl).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        400,
        80
      )
    })

    it('should use default quality when not specified', () => {
      const { ImageOptimization } = require('@/lib/performance')
      
      render(<OptimizedImage {...defaultProps} />)
      
      expect(ImageOptimization.getOptimizedImageUrl).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        800,
        80
      )
    })
  })

  describe('sizes attribute', () => {
    it('should apply default sizes', () => {
      render(<OptimizedImage {...defaultProps} />)
      
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw')
    })

    it('should apply custom sizes', () => {
      render(<OptimizedImage {...defaultProps} sizes="(max-width: 600px) 100vw, 50vw" />)
      
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('sizes', '(max-width: 600px) 100vw, 50vw')
    })
  })
})

describe('ResponsiveImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('should render with responsive sizing', () => {
    render(<ResponsiveImage {...defaultProps} />)
    
    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
  })

  it('should use custom breakpoints', () => {
    const customBreakpoints = {
      sm: 300,
      md: 500,
      lg: 700,
      xl: 1000,
    }

    render(<ResponsiveImage {...defaultProps} breakpoints={customBreakpoints} />)
    
    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
  })

  it('should adjust quality based on screen size', () => {
    const { ImageOptimization } = require('@/lib/performance')
    
    // Set small screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400,
    })

    render(<ResponsiveImage {...defaultProps} />)
    
    expect(ImageOptimization.getOptimizedImageUrl).toHaveBeenCalledWith(
      'https://example.com/image.jpg',
      400,
      70
    )
  })
})

describe('BackgroundImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test background',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with background image', () => {
    render(<BackgroundImage {...defaultProps} />)
    
    const container = document.querySelector('div')
    expect(container).toHaveStyle({
      backgroundImage: 'url(https://example.com/image.jpg?w=1200&q=85)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    })
  })

  it('should render children', () => {
    render(
      <BackgroundImage {...defaultProps}>
        <div data-testid="child">Child content</div>
      </BackgroundImage>
    )
    
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('should apply overlay when specified', () => {
    render(<BackgroundImage {...defaultProps} overlay={true} />)
    
    const overlay = document.querySelector('div[style*="background-color: rgba(0, 0, 0, 0.5)"]')
    expect(overlay).toBeInTheDocument()
  })

  it('should apply custom overlay color', () => {
    render(<BackgroundImage {...defaultProps} overlay={true} overlayColor="rgba(255, 0, 0, 0.5)" />)
    
    const overlay = document.querySelector('div[style*="background-color: rgba(255, 0, 0, 0.5)"]')
    expect(overlay).toBeInTheDocument()
  })

  it('should handle empty src', () => {
    render(<BackgroundImage src="" alt="Empty background" />)
    
    const container = document.querySelector('div')
    expect(container).toHaveStyle({
      backgroundImage: 'none',
    })
  })
})

// Helper function to simulate events
const fireEvent = {
  load: (element: HTMLElement) => {
    element.dispatchEvent(new Event('load', { bubbles: true }))
  },
  error: (element: HTMLElement) => {
    element.dispatchEvent(new Event('error', { bubbles: true }))
  },
} 
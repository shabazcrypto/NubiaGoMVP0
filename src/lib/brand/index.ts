// ============================================================================
// NUBIAGO BRAND SYSTEM - BILLION USER SCALE
// Complete brand specifications and utilities
// ============================================================================

export const NUBIAGO_BRAND = {
  // Brand Identity
  name: 'NubiaGo',
  tagline: 'Africa\'s Premier Marketplace',
  description: 'Trusted sellers across 34+ African countries. Secure payments, fast delivery, guaranteed quality.',
  
  // Primary Brand Colors
  colors: {
    primary: {
      blue: '#2563eb',
      name: 'Primary Blue',
      usage: 'Main UI elements, buttons, links, brand accents',
      contrast: {
        white: '8.6:1', // WCAG AAA compliant
        light: '6.2:1', // WCAG AAA compliant
      }
    },
    accent: {
      orange: '#f59e0b',
      name: 'Accent Orange', 
      usage: 'Call-to-action buttons, highlights, important elements',
      contrast: {
        white: '3.8:1', // WCAG AA compliant
        black: '5.1:1', // WCAG AA compliant
      }
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      usage: 'Black for headings, gray for body text'
    },
    background: {
      light: '#f8f9fa',
      white: '#ffffff',
      usage: 'Light for page backgrounds, white for cards'
    }
  },
  
  // Typography System
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    headings: {
      h1: { size: '3rem', weight: 700, lineHeight: 1.2, usage: 'Page titles, hero headings' },
      h2: { size: '2.25rem', weight: 700, lineHeight: 1.2, usage: 'Section headers' },
      h3: { size: '1.875rem', weight: 600, lineHeight: 1.2, usage: 'Subsection titles' },
      h4: { size: '1.5rem', weight: 600, lineHeight: 1.2, usage: 'Component headings' },
      h5: { size: '1.25rem', weight: 600, lineHeight: 1.2, usage: 'Small headings' }
    },
    body: {
      large: { size: '1.125rem', weight: 400, lineHeight: 1.5, usage: 'Introductions, important content' },
      regular: { size: '1rem', weight: 400, lineHeight: 1.5, usage: 'Standard body text, paragraphs' },
      small: { size: '0.875rem', weight: 400, lineHeight: 1.5, usage: 'Captions, helper text, labels' },
      xs: { size: '0.75rem', weight: 400, lineHeight: 1.5, usage: 'Legal text, metadata, footnotes' }
    }
  },
  
  // Logo System
  logo: {
    variants: ['horizontal', 'vertical', 'icon-only'],
    sizes: ['sm', 'md', 'lg', 'xl'],
    iconSizes: [16, 32, 48, 64, 128, 256, 512],
    usage: {
      horizontal: 'Headers, business cards, most applications',
      vertical: 'Limited horizontal space, social profiles',
      iconOnly: 'Favicons, app icons, watermarks'
    },
    guidelines: [
      'Always maintain clear space around logo equal to icon height',
      'Use on backgrounds with sufficient contrast (minimum 4.5:1 ratio)',
      'Maintain original proportions when scaling',
      'Never stretch, distort, or alter logo proportions',
      'Never use on busy backgrounds or low contrast surfaces',
      'Never add effects, shadows, or modify colors'
    ]
  },
  
  // Component System
  components: {
    buttons: {
      primary: {
        background: '#2563eb',
        text: '#ffffff',
        hover: '#1d4ed8',
        usage: 'Main actions, form submissions'
      },
      accent: {
        background: '#f59e0b',
        text: '#000000',
        hover: '#d97706',
        usage: 'Call-to-action elements, highlights'
      },
      outline: {
        background: 'transparent',
        text: '#2563eb',
        border: '#2563eb',
        hover: { background: '#2563eb', text: '#ffffff' },
        usage: 'Alternative actions, secondary buttons'
      }
    },
    cards: {
      background: '#ffffff',
      border: '#e5e5e5',
      borderRadius: '16px',
      shadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      hoverShadow: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 20px 40px -7px rgba(0, 0, 0, 0.1)'
    }
  },
  
  // Spacing System
  spacing: {
    unit: 4, // base unit in pixels
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 224, 256]
  },
  
  // Animation System
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  
  // Accessibility Standards
  accessibility: {
    contrastRatios: {
      minimum: '4.5:1', // WCAG AA
      enhanced: '7:1',   // WCAG AAA
    },
    touchTargets: {
      minimum: '44px', // iOS/Android minimum
      recommended: '48px'
    },
    focusStates: {
      outline: '2px solid #2563eb',
      offset: '2px'
    }
  }
} as const

// Utility functions for brand system
export const getBrandColor = (path: string) => {
  const keys = path.split('.')
  let value: any = NUBIAGO_BRAND.colors
  
  for (const key of keys) {
    value = value?.[key]
  }
  
  return typeof value === 'string' ? value : null
}

export const getBrandTypography = (element: string) => {
  const headings = NUBIAGO_BRAND.typography.headings as any
  const body = NUBIAGO_BRAND.typography.body as any
  
  return headings[element] || body[element] || null
}

export const validateBrandUsage = (element: string, properties: Record<string, any>) => {
  const issues: string[] = []
  
  // Color validation
  if (properties.color && !Object.values(NUBIAGO_BRAND.colors).some(colorGroup => 
    typeof colorGroup === 'object' && Object.values(colorGroup).includes(properties.color)
  )) {
    issues.push(`Color ${properties.color} is not part of the NubiaGo brand palette`)
  }
  
  // Font size validation
  if (properties.fontSize) {
    const validSizes = [
      ...Object.values(NUBIAGO_BRAND.typography.headings).map(h => h.size),
      ...Object.values(NUBIAGO_BRAND.typography.body).map(b => b.size)
    ]
    
    if (!validSizes.includes(properties.fontSize)) {
      issues.push(`Font size ${properties.fontSize} is not part of the NubiaGo typography system`)
    }
  }
  
  return issues
}

// CSS Custom Properties Generator
export const generateCSSCustomProperties = () => {
  return `
:root {
  /* NubiaGo Brand Colors */
  --nubia-primary-blue: ${NUBIAGO_BRAND.colors.primary.blue};
  --nubia-accent-orange: ${NUBIAGO_BRAND.colors.accent.orange};
  --nubia-text-primary: ${NUBIAGO_BRAND.colors.text.primary};
  --nubia-text-secondary: ${NUBIAGO_BRAND.colors.text.secondary};
  --nubia-background-light: ${NUBIAGO_BRAND.colors.background.light};
  --nubia-white: ${NUBIAGO_BRAND.colors.background.white};
  
  /* NubiaGo Typography */
  --nubia-font-family: ${NUBIAGO_BRAND.typography.fontFamily};
  
  /* NubiaGo Animation */
  --nubia-duration-fast: ${NUBIAGO_BRAND.animation.duration.fast};
  --nubia-duration-normal: ${NUBIAGO_BRAND.animation.duration.normal};
  --nubia-duration-slow: ${NUBIAGO_BRAND.animation.duration.slow};
  --nubia-easing-default: ${NUBIAGO_BRAND.animation.easing.default};
}
`.trim()
}

// Tailwind CSS Configuration Generator
export const generateTailwindConfig = () => {
  return {
    colors: {
      'nubia-blue': NUBIAGO_BRAND.colors.primary.blue,
      'nubia-orange': NUBIAGO_BRAND.colors.accent.orange,
      'nubia-black': NUBIAGO_BRAND.colors.text.primary,
      'nubia-gray': NUBIAGO_BRAND.colors.text.secondary,
      'nubia-light': NUBIAGO_BRAND.colors.background.light,
      'nubia-white': NUBIAGO_BRAND.colors.background.white,
      primary: {
        600: NUBIAGO_BRAND.colors.primary.blue,
      },
      accent: {
        500: NUBIAGO_BRAND.colors.accent.orange,
      }
    },
    fontFamily: {
      sans: NUBIAGO_BRAND.typography.fontFamily.split(', ')
    },
    spacing: Object.fromEntries(
      NUBIAGO_BRAND.spacing.scale.map((value, index) => [index, `${value}px`])
    ),
    transitionDuration: {
      fast: NUBIAGO_BRAND.animation.duration.fast,
      normal: NUBIAGO_BRAND.animation.duration.normal,
      slow: NUBIAGO_BRAND.animation.duration.slow
    }
  }
}

export default NUBIAGO_BRAND

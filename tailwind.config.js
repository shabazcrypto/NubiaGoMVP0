/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', 'class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
  	extend: {
  		colors: {
  			primary: {
  				'50': '#eff6ff',
  				'100': '#dbeafe',
  				'200': '#bfdbfe',
  				'300': '#93c5fd',
  				'400': '#60a5fa',
  				'500': '#3b82f6',
  				'600': '#2563eb',
  				'700': '#1d4ed8',
  				'800': '#1e40af',
  				'900': '#1e3a8a',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			accent: {
  				'50': '#fefce8',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				'800': '#92400e',
  				'900': '#78350f',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			secondary: {
  				'50': '#f8fafc',
  				'100': '#f1f5f9',
  				'200': '#e2e8f0',
  				'300': '#cbd5e1',
  				'400': '#94a3b8',
  				'500': '#64748b',
  				'600': '#475569',
  				'700': '#334155',
  				'800': '#1e293b',
  				'900': '#0f172a',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			'brand-text': {
  				primary: '#000000',
  				secondary: '#666666'
  			},
  			'brand-bg': {
  				light: '#f8f9fa',
  				white: '#ffffff'
  			},
  			yellow: {
  				'50': '#fefce8',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				'800': '#92400e',
  				'900': '#78350f'
  			},
  			neutral: {
  				'50': '#fafafa',
  				'100': '#f5f5f5',
  				'200': '#e5e5e5',
  				'300': '#d4d4d4',
  				'400': '#a3a3a3',
  				'500': '#737373',
  				'600': '#525252',
  				'700': '#404040',
  				'800': '#262626',
  				'900': '#171717'
  			},
  			success: {
  				'50': '#f0fdf4',
  				'500': '#22c55e',
  				'900': '#14532d'
  			},
  			warning: {
  				'50': '#fefce8',
  				'500': '#f59e0b',
  				'900': '#78350f'
  			},
  			error: {
  				'50': '#fef2f2',
  				'500': '#ef4444',
  				'900': '#7f1d1d'
  			},
  			'nubia-blue': '#2563eb',
  			'nubia-orange': '#f59e0b',
  			'nubia-black': '#000000',
  			'nubia-gray': '#666666',
  			'nubia-light': '#f8f9fa',
  			'nubia-white': '#ffffff',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			heading: [
  				'Poppins',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'Poppins',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			body: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'bounce-in': 'bounceIn 0.6s ease-out',
  			'scale-in': 'scaleIn 0.2s ease-out',
  			'slide-down': 'slideDown 0.3s ease-out',
  			'slide-left': 'slideLeft 0.3s ease-out',
  			'slide-right': 'slideRight 0.3s ease-out',
  			'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'bounce-subtle': 'bounceSubtle 0.5s ease-out',
  			'cart-bounce': 'cartBounce 0.6s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' }
  			},
  			slideUp: {
  				'0%': { transform: 'translateY(10px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			slideDown: {
  				'0%': { transform: 'translateY(-10px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			slideLeft: {
  				'0%': { transform: 'translateX(10px)', opacity: '0' },
  				'100%': { transform: 'translateX(0)', opacity: '1' }
  			},
  			slideRight: {
  				'0%': { transform: 'translateX(-10px)', opacity: '0' },
  				'100%': { transform: 'translateX(0)', opacity: '1' }
  			},
  			scaleIn: {
  				'0%': { transform: 'scale(0.95)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' }
  			},
  			bounceIn: {
  				'0%': { transform: 'scale(0.3)', opacity: '0' },
  				'50%': { transform: 'scale(1.05)' },
  				'70%': { transform: 'scale(0.9)' },
  				'100%': { transform: 'scale(1)', opacity: '1' }
  			},
  			bounceSubtle: {
  				'0%': { transform: 'scale(1)' },
  				'50%': { transform: 'scale(1.05)' },
  				'100%': { transform: 'scale(1)' }
  			},
  			cartBounce: {
  				'0%': { transform: 'scale(1)' },
  				'25%': { transform: 'scale(1.1) rotate(3deg)' },
  				'50%': { transform: 'scale(1.05) rotate(-3deg)' },
  				'75%': { transform: 'scale(1.02) rotate(1deg)' },
  				'100%': { transform: 'scale(1) rotate(0deg)' }
  			}
  		},
  		spacing: {
  			'18': '4.5rem',
  			'72': '18rem',
  			'84': '21rem',
  			'88': '22rem',
  			'128': '32rem'
  		},
  		maxWidth: {
  			'8xl': '88rem',
  			'9xl': '96rem'
  		},
  		boxShadow: {
  			soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  			medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  			strong: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
  			elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  		},
  		borderRadius: {
  			'4xl': '2rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
      require("tailwindcss-animate")
],
} 
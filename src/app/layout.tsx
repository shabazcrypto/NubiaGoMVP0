import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/lib/asset-preloader' // Initialize asset preloading
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { FirebaseAuthProvider } from '@/hooks/useFirebaseAuth'
import { RoleChangeHandler } from '@/components/auth/role-change-handler'
import ConditionalNavigation from '@/components/layout/conditional-navigation'
import StoreProvider from '@/components/providers/store-provider'
import { Footer } from '@/components/ui/footer'
import { Loading } from '@/components/ui/loading'

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nubiago-aa411.web.app'),
  title: 'NubiaGo - Find what you need, faster!',
  description: 'Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.',
  authors: [{ name: 'NubiaGo Team' }],
  keywords: ['ecommerce', 'africa', 'online shopping', 'nubiaGo'],
  robots: 'index, follow',
  openGraph: {
    title: 'NubiaGo - Find what you need, faster!',
    description: 'Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.',
    url: 'https://nubiago-aa411.web.app/',
    siteName: 'NubiaGo',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@nubiaGo',
    title: 'NubiaGo - Find what you need, faster!',
    description: 'Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { rel: 'icon', url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#0F52BA',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'NubiaGo',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth dark:bg-gray-900">
      <head>
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* Critical CSS preload */}
        <link rel="preload" href="/globals.css" as="style" />
        
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Font Awesome - load asynchronously */}
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          rel="stylesheet" 
        />
        
        {/* Meta tags for performance */}
        <meta name="theme-color" content="#0F52BA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NubiaGo" />
        
        {/* Resource hints for critical resources */}
        <link rel="preload" href="/api/health" as="fetch" crossOrigin="anonymous" />
        
        {/* Critical images preload */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        
        {/* Service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} dark:bg-gray-900 dark:text-gray-100`}>
        <ErrorBoundary>
          <FirebaseAuthProvider>
            <ToastProvider>
              <StoreProvider>
                <RoleChangeHandler>
                  <ConditionalNavigation />
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <Footer />
                </RoleChangeHandler>
              </StoreProvider>
            </ToastProvider>
          </FirebaseAuthProvider>
        </ErrorBoundary>
        <SpeedInsights />
        
        {/* Load Font Awesome JS asynchronously */}
        <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"
          async
          defer
        />
        
        {/* Performance monitoring */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Performance monitoring
                if (typeof window !== 'undefined') {
                  window.addEventListener('load', function() {
                    setTimeout(function() {
                      const perfData = performance.getEntriesByType('navigation')[0];
                      if (perfData) {
                        console.log('Page Load Performance:', {
                          'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart + 'ms',
                          'Load Complete': perfData.loadEventEnd - perfData.loadEventStart + 'ms',
                          'Total Load Time': perfData.loadEventEnd - perfData.fetchStart + 'ms'
                        });
                      }
                    }, 0);
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  )
} 
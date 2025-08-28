import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/lib/asset-preloader' // Initialize asset preloading
import { SpeedInsights } from "@vercel/speed-insights/next"
// import { ToastProvider } from '@/components/ui/toast' // Disabled to prevent infinite loops
// import { Toaster } from '@/components/ui/toaster' // Temporarily disabled due to infinite loop
import { ErrorBoundaryProvider } from '@/components/providers/error-boundary-provider'
import { performanceMonitor } from '@/lib/utils/performance-monitor'
import { FirebaseAuthProvider } from '@/hooks/useFirebaseAuth'
import SSRSafeErrorBoundary from '@/components/ui/SSRSafeErrorBoundary'
import { RoleChangeHandler } from '@/components/auth/role-change-handler'
import ConditionalNavigation from '@/components/layout/conditional-navigation'
import StoreProvider from '@/components/providers/store-provider'
import { Footer } from '@/components/ui/footer'
import { SimpleLoading } from '@/components/ui/simple-loading'
import { UnifiedHeader } from '@/components/navigation/UnifiedHeader'
import { UnifiedBottomNav } from '@/components/navigation/UnifiedBottomNav'
import { MobileOptimizationProvider } from '@/components/providers/mobile-optimization-provider'
import { MobileMenuProvider } from '@/components/providers/mobile-menu-provider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Suspense } from 'react'

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://home-base-one.vercel.app'),
  title: 'HomeBase - Find what you need, faster!',
  description: 'Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.',
  authors: [{ name: 'HomeBase Team' }],
  keywords: ['ecommerce', 'africa', 'online shopping', 'homebase'],
  robots: 'index, follow',
  openGraph: {
    title: 'HomeBase - Find what you need, faster!',
    description: 'Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.',
    url: 'https://home-base-one.vercel.app/',
    siteName: 'HomeBase',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@homebase',
    title: 'HomeBase - Find what you need, faster!',
    description: 'Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
     other: {
     'theme-color': '#0F52BA',
     'apple-mobile-web-app-capable': 'yes',
     'apple-mobile-web-app-status-bar-style': 'default',
     'apple-mobile-web-app-title': 'HomeBase',
   },
}

// Loading fallback component
function AppLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <div className="w-16 h-16 bg-white rounded-2xl animate-spin"></div>
          </div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-primary-600 border-r-secondary-600 rounded-3xl animate-spin mx-auto"></div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Loading HomeBase...
          </h2>
          <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            Please wait while we prepare your shopping experience
          </p>
        </div>

        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-secondary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth dark:bg-gray-900">
      <head>
        {/* ============================================================================
        PERFORMANCE OPTIMIZATIONS - CRITICAL RESOURCE PRELOADING
        ============================================================================ */}

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="//firebasestorage.googleapis.com" />
                 <link rel="dns-prefetch" href="//api.homebase.com" />

         {/* Preconnect to critical origins */}
         <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
         <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
         <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
         <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
         {/* Removed Unsplash preconnect to avoid failing DNS/requests */}
         <link rel="preconnect" href="https://api.homebase.com" crossOrigin="anonymous" />

        {/* ============================================================================
        CRITICAL RESOURCE PRELOADING
        ============================================================================ */}

        {/* Critical CSS preload */}
        <link rel="preload" href="/globals.css" as="style" />
        <link rel="preload" href="/mobile.css" as="style" media="(max-width: 768px)" />
        <link rel="preload" href="/desktop.css" as="style" media="(min-width: 769px)" />

        {/* Critical fonts preload */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          as="style"
        />

        {/* Critical images preload */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/hero-image.webp" as="image" type="image/webp" />
        <link rel="preload" href="/fallback-product.jpg" as="image" type="image/jpeg" />

        {/* Critical JavaScript preload */}
        <link rel="preload" href="/sw.js" as="script" />

        {/* Critical API endpoints preload */}
        <link rel="preload" href="/api/products" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/categories" as="fetch" crossOrigin="anonymous" />

        {/* ============================================================================
        INTELLIGENT PREFETCHING - LIKELY NEXT PAGES
        ============================================================================ */}

        {/* Main navigation pages */}
        <link rel="prefetch" href="/products" as="document" />
        <link rel="prefetch" href="/categories" as="document" />
        <link rel="prefetch" href="/cart" as="document" />
        <link rel="prefetch" href="/account" as="document" />
        <link rel="prefetch" href="/search" as="document" />

        {/* Product listing and detail patterns */}
        <link rel="prefetch" href="/products?category=electronics" as="document" />
        <link rel="prefetch" href="/products?category=fashion" as="document" />
        <link rel="prefetch" href="/products?category=home-living" as="document" />

        {/* ============================================================================
        MOBILE-OPTIMIZED RESOURCE HINTS
        ============================================================================ */}

                 {/* Favicon and Touch Icons */}
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32" type="image/x-icon" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />

        {/* Mobile-specific CSS */}
        <link rel="preload" href="/mobile.css" as="style" media="(max-width: 768px)" />

        {/* ============================================================================
        FAVICONS AND ICONS
        ============================================================================ */}

                 {/* App Icons */}
         <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
         <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
         <link rel="shortcut icon" href="/favicon-32x32.png" />
         <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
         <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
         <link rel="manifest" href="/manifest.json" />
         <link rel="manifest" href="/site.webmanifest" />

        {/* ============================================================================
        EXTERNAL RESOURCES
        ============================================================================ */}

        {/* Font Awesome - load asynchronously */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />

        {/* ============================================================================
        META TAGS FOR PERFORMANCE
        ============================================================================ */}

        <meta name="theme-color" content="#0F52BA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                 <meta name="apple-mobile-web-app-title" content="HomeBase" />

        {/* Performance optimization meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ============================================================================
        SERVICE WORKER REGISTRATION
        ============================================================================ */}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      // // // console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      // // // console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} dark:bg-gray-900 dark:text-gray-100`}>
                 <ErrorBoundaryProvider>
           <Suspense fallback={<SimpleLoading timeout={15000} />}>
             <SSRSafeErrorBoundary>
               <FirebaseAuthProvider>
                 {/* <ToastProvider> */}
                   <StoreProvider>
                     <RoleChangeHandler>
                       <MobileOptimizationProvider>
                                                 <MobileMenuProvider>
                            {/* Unified Header with Top Utility Bar, Main Header, and Categories */}
                            <ErrorBoundary>
                              <UnifiedHeader />
                            </ErrorBoundary>

                            {/* Desktop navigation - DISABLED - UnifiedHeader handles all navigation */}
                            {/* <ConditionalNavigation /> */}

                            {/* Main content with proper spacing */}
                            <main className="min-h-screen pb-20 lg:pb-0">
                              {children}
                            </main>

                            {/* Unified bottom navigation */}
                            <ErrorBoundary>
                              <UnifiedBottomNav />
                            </ErrorBoundary>

                            {/* Desktop footer */}
                            <div className="hidden lg:block">
                              <Footer />
                            </div>
                          </MobileMenuProvider>
                       </MobileOptimizationProvider>
                     </RoleChangeHandler>
                   </StoreProvider>
                 {/* </ToastProvider> */}
               </FirebaseAuthProvider>
             </SSRSafeErrorBoundary>
           </Suspense>
         </ErrorBoundaryProvider>
        {/* <Toaster /> */}
        <SpeedInsights />

        {/* ============================================================================
        ASYNCHRONOUS RESOURCE LOADING
        ============================================================================ */}

        {/* Load Font Awesome JS asynchronously */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"
          async
          defer
        />

        {/* ============================================================================
        PERFORMANCE MONITORING
        ============================================================================ */}

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
                        // // // console.log('Page Load Performance:', {
                          'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart + 'ms',
                          'Load Complete': perfData.loadEventEnd - perfData.loadEventStart + 'ms',
                          'Total Load Time': perfData.loadEventEnd - perfData.fetchStart + 'ms'
                        });
                      }

                      // Log resource hints statistics
                      if (window.assetPreloader) {
                        // // // console.log('Resource Hints Stats:', window.assetPreloader.getStats());
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

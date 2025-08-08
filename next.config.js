/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // PERFORMANCE OPTIMIZATION CONFIGURATION
  // ============================================================================
  // Optimized for maximum performance and minimal bundle size
  trailingSlash: true,
  
  // ============================================================================
  // IMAGE OPTIMIZATION
  // ============================================================================
  images: {
    unoptimized: false, // Vercel handles image optimization
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/o/**',
      },
    ],
    domains: ['images.unsplash.com', 'firebasestorage.googleapis.com'],
  },

  // ============================================================================
  // COMPILER OPTIMIZATION
  // ============================================================================
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },

  // ============================================================================
  // EXPERIMENTAL FEATURES (PERFORMANCE FOCUSED)
  // ============================================================================
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@headlessui/react', 
      '@heroicons/react', 
      'lucide-react',
      'framer-motion',
      'react-hook-form',
      'zustand',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'date-fns',
      'uuid',
      '@hookform/resolvers',
      'zod'
    ],
    webpackBuildWorker: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // ============================================================================
  // WEBPACK OPTIMIZATION
  // ============================================================================
  webpack: (config, { dev, isServer }) => {
    // Handle Node.js modules for server-side code
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
        'firebase-admin/app': 'commonjs firebase-admin/app',
        'firebase-admin/auth': 'commonjs firebase-admin/auth',
        'firebase-admin/firestore': 'commonjs firebase-admin/firestore',
        'firebase-admin/storage': 'commonjs firebase-admin/storage',
      })
    }

    // Handle node: protocol and Node.js modules for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'node:process': false,
        'node:fs': false,
        'node:path': false,
        'node:crypto': false,
        'node:stream': false,
        'node:util': false,
        'node:buffer': false,
        'node:events': false,
        'node:querystring': false,
        'node:url': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:child_process': false,
        'node:cluster': false,
        'node:dgram': false,
        'node:dns': false,
        'node:domain': false,
        'node:module': false,
        'node:net': false,
        'node:os': false,
        'node:punycode': false,
        'node:readline': false,
        'node:repl': false,
        'node:string_decoder': false,
        'node:sys': false,
        'node:timers': false,
        'node:tls': false,
        'node:tty': false,
        'node:vm': false,
        'node:worker_threads': false,
        process: false,
      }
    }

    // Advanced bundle optimization for production
    if (!dev && !isServer) {
      // Split chunks optimization with enhanced granularity
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // React ecosystem (highest priority)
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 40,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Firebase ecosystem
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 35,
            reuseExistingChunk: true,
            enforce: true,
          },
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|@heroicons|lucide-react|framer-motion)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
          // Form and validation libraries
          forms: {
            test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
            name: 'forms',
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
          // Date and utility libraries
          utils: {
            test: /[\\/]node_modules[\\/](date-fns|lodash|uuid)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Remaining vendor code
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Common application code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      }
      
      // Tree shaking optimization
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
      
      // Minimization optimization
      config.optimization.minimize = true
      config.optimization.minimizer = config.optimization.minimizer || []
    }

    // Handle SVG files with optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Bundle analyzer (only in development)
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      )
    }

    return config
  },

  // ============================================================================
  // HEADERS & CACHING OPTIMIZATION
  // ============================================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },

  // ============================================================================
  // REWRITES FOR PERFORMANCE
  // ============================================================================
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig 
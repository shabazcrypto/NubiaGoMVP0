/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // ULTRA-FAST DEVELOPMENT CONFIGURATION
  // ============================================================================
  
  // Disable image optimization in development for speed
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    domains: ['localhost'],
  },

  // ============================================================================
  // COMPILER OPTIMIZATION - MINIMAL FOR SPEED
  // ============================================================================
  compiler: {
    removeConsole: false, // Keep console in dev
  },

  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS - MAXIMUM SPEED
  // ============================================================================
  trailingSlash: false,
  generateEtags: false,
  compress: false,
  poweredByHeader: false,
  
  // Disable slower features
  reactStrictMode: false,

  // ============================================================================
  // EXPERIMENTAL FEATURES - SPEED FOCUSED
  // ============================================================================
  experimental: {
    webpackBuildWorker: false,
    optimizeCss: false,
    optimizePackageImports: [],
  },

  // ============================================================================
  // TURBOPACK CONFIGURATION (Stable in Next.js 15+)
  // ============================================================================
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // ============================================================================
  // WEBPACK OPTIMIZATION - ULTRA-FAST DEVELOPMENT
  // ============================================================================
  webpack: (config, { dev, isServer }) => {
    // Aggressive development optimizations
    if (dev) {
      // Use fastest source maps
      config.devtool = 'eval'
      
      // Disable all optimizations in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
        minimize: false,
        concatenateModules: false,
        usedExports: false,
        sideEffects: false,
      }
      
      // Fastest possible file watching
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 50,
        ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**', '**/public/**'],
      }

      // Disable cache for faster initial compilation
      config.cache = false
    }

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

    // Handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Production optimizations
    if (!dev) {
      // Add webpack bundle analyzer in production builds (optional)
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-analysis.html',
          })
        )
      }
    }

    return config
  },

  // ============================================================================
  // HEADERS & CACHING OPTIMIZATION
  // ============================================================================
  async headers() {
    if (process.env.NODE_ENV === 'development') return []
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
      // Keep API passthrough
      { source: '/api/:path*', destination: '/api/:path*' },
    ]
  },
}

module.exports = nextConfig 
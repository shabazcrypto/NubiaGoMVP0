const webpack = require('webpack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration
  reactStrictMode: false,
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true, // Prevent ESLint from failing builds
    ignoreDevelopmentErrors: true, // Prevent ESLint errors in development
    dirs: ['src', 'pages', 'components', 'lib', 'utils'], // Directories to lint
  },
  
  // Image optimization
  images: {
    unoptimized: false, // Enable image optimization
    dangerouslyAllowSVG: true,
    domains: [
      'localhost',
      'firebasestorage.googleapis.com',
      'nubiago.vercel.app'
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    disableStaticImages: false,
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    minify: true,
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    removeDebugger: process.env.NODE_ENV === 'production',
  },

  // Performance settings
  trailingSlash: false,
  generateEtags: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  crossOrigin: 'anonymous',

  // Experimental features
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-tabs',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
    optimizeCss: true,
    scrollRestoration: true,
    legacyBrowsers: false,
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Development optimizations
    if (dev) {
      config.devtool = 'eval'
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
      
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 50,
        ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**', '**/public/**'],
      }
      
      config.cache = false
    }

    // Handle Node.js modules for server-side
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

    // Handle client-side polyfills and fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: require.resolve('browserify-fs'),
        net: require.resolve('net-browserify'),
        tls: require.resolve('tls-browserify'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url/'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert/'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
      }

      // Add buffer polyfill
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      )
    }

    // Handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // Headers for production
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

  // Rewrites
  async rewrites() {
    return [
      { source: '/api/:path*', destination: '/api/:path*' },
    ]
  },
}

module.exports = nextConfig 
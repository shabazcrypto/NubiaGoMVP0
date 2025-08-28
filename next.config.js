/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  swcMinify: true,
  // Configure SWC for optimal TypeScript/JavaScript compilation
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  // Experimental features for faster development
  experimental: {
    // Server Actions are now enabled by default in Next.js 14+
    serverComponentsExternalPackages: ['firebase-admin'],
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast'
    ],
    // Enhanced optimization features
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Enhanced Webpack optimizations
  webpack: (config, { isServer, dev, buildId }) => {
    // Client-side polyfills
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      }
    }

    // Development optimizations
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
      // Disable some development checks
      config.devtool = 'eval-source-map'
    } else {
      // Production optimizations
      config.optimization = {
        ...config.optimization,
        // Enhanced chunk splitting for better caching
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor libraries chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Firebase chunk (large dependency)
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              name: 'firebase',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Radix UI chunk
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix-ui',
              chunks: 'all',
              priority: 15,
              reuseExistingChunk: true,
            },
            // React ecosystem chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Common utilities chunk
            utils: {
              test: /[\\/]node_modules[\\/](lodash|date-fns|uuid|clsx|tailwind-merge)[\\/]/,
              name: 'utils',
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
            // Default chunk for remaining modules
            default: {
              minChunks: 2,
              priority: -10,
              reuseExistingChunk: true,
            },
          },
        },
        // Enhanced module concatenation
        concatenateModules: true,
        // Improved tree shaking
        usedExports: true,
        sideEffects: false,
      }

      // Bundle analyzer in production builds (when ANALYZE=true)
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

    // Enhanced module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize React imports
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
    }

    // Optimize module rules for better performance
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
              decorators: false,
              dynamicImport: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
                development: dev,
                refresh: dev,
              },
            },
            target: 'es2020',
            loose: true,
          },
          minify: !dev,
        },
      },
    })

    return config
  },

  // Image optimization
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos'
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128],
  },

  // Headers for development performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
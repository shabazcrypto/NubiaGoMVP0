const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Enable faster builds in development
process.env.NEXT_TELEMETRY_DISABLED = '1'
process.env.NEXT_OPTIMIZE_FONTS = 'false'
process.env.NEXT_OPTIMIZE_IMAGES = 'false'
process.env.NEXT_OPTIMIZE_CSS = 'false'

// Initialize Next.js with optimized options
const app = next({
  dev,
  hostname,
  port,
  conf: {
    onDemandEntries: {
      // Reduce page buffer size
      maxInactiveAge: 15 * 1000,
      pagesBufferLength: 2,
    }
  }
})

const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Parse URL once
      const parsedUrl = parse(req.url, true)
      
      // Add development headers
      if (dev) {
        res.setHeader('Cache-Control', 'no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
      }

      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })

  // Enable keep-alive connections
  server.keepAliveTimeout = 60000

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
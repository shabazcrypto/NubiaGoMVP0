import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

export default async function handler(req, res) {
  try {
    // Parse URL
    const parsedUrl = parse(req.url, true)
    
    // Initialize Next.js if not already initialized
    if (!app.prepared) {
      await app.prepare()
    }

    // Let Next.js handle the request
    await handle(req, res, parsedUrl)
  } catch (err) {
    console.error('Error occurred handling', req.url, err)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
}

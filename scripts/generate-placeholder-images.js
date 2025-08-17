/*
 Generates placeholder image files in the public/ directory for all referenced assets.
 Creates lightweight 1x1 images per extension to stop 404s immediately.
 Run: npm run assets:generate
*/
const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.join(process.cwd(), 'public')

// Minimal 1x1 pixel assets per format (base64)
const ONE_BY_ONE = {
  jpg: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUTEhIVFhUVFRUVFRUVFRUVFRUWFhUVFhUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGi0fICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAcAAEAAgIDAQAAAAAAAAAAAAAABQYDBAcCAQj/xABBEAACAQICBgYGCwAAAAAAAAABAgMEEQAFEiExQVFhBhMicYGRodEjQlJicoKSwfAzU4Ky0vEkQ2PC/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAhEQEBAQEAAgMBAAAAAAAAAAABAgMRIRIxQQQiUf/aAAwDAQACEQMRAD8A9mQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//Z',
  png: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
  webp: 'UklGRiIAAABXRUJQVlA4WAoAAAAQAAAAAQAAAwAAQUxQSAIAAAAAAQAAAnQAAQAAADwA'
}

// Files to generate (from code references)
const FILES = [
  'hero-pattern.svg',
  'ui-hero-banner.jpg',
  'hero-image.webp',
  'fallback-product.jpg',
  'favicon-32x32.png',
  'favicon.svg',
  'apple-touch-icon.png',
  // Product
  'product-tech-1.jpg','product-headphones-1.jpg','product-headphones-2.jpg','product-cosmetics-1.jpg','product-watch-1.jpg','product-watch-2.jpg','product-watch-3.jpg','product-home-1.jpg','product-accessories-1.jpg','product-fashion-1.jpg','product-bag-1.jpg','product-bag-2.jpg','product-shoes-1.jpg','product-logo-1.jpg','product-clothing-1.jpg','product-brand-1.jpg','product-edit-1.jpg','product-order-2.jpg','product-api-3.jpg',
  // Category
  'category-cosmetics.jpg','category-men.jpg','category-mother-child.jpg','category-home-living.jpg','category-electronics-2.jpg','category-electronics.jpg','category-shoes-bags.jpg','category-api-5.jpg',
  // Avatars/Logos
  'avatar-user-1.jpg','avatar-user-2.jpg','avatar-user-3.jpg','avatar-user-5.jpg','ui-logo-1.jpg','ui-supplier-logo-1.jpg',
  // Demo/dashboard
  'headphones.jpg','watch.jpg','laptop-stand.jpg','mouse.jpg','keyboard.jpg','charger.jpg','chair.jpg'
]

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function writeSvgPlaceholder(filePath) {
  const name = path.basename(filePath)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">\n<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs>\n<rect width="1200" height="800" fill="url(#g)"/>\n<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="42" fill="#ffffff" opacity="0.9">${name}</text>\n</svg>`
  fs.writeFileSync(filePath, svg, 'utf8')
}

function writeBinaryPlaceholder(filePath) {
  const ext = path.extname(filePath).toLowerCase().replace('.', '')
  let b64
  if (ext === 'jpg' || ext === 'jpeg') b64 = ONE_BY_ONE.jpg
  else if (ext === 'png') b64 = ONE_BY_ONE.png
  else if (ext === 'webp') b64 = ONE_BY_ONE.webp
  else return writeSvgPlaceholder(filePath)
  const buf = Buffer.from(b64, 'base64')
  fs.writeFileSync(filePath, buf)
}

function main() {
  ensureDir(PUBLIC_DIR)
  let created = 0
  for (const rel of FILES) {
    const filePath = path.join(PUBLIC_DIR, rel)
    if (fs.existsSync(filePath)) continue
    ensureDir(path.dirname(filePath))
    if (rel.endsWith('.svg')) writeSvgPlaceholder(filePath)
    else writeBinaryPlaceholder(filePath)
    created++
  }
  console.log(`Placeholder images created: ${created}. Location: ${PUBLIC_DIR}`)
}

main()



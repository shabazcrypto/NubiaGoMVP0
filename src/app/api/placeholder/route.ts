import { NextResponse } from 'next/server'

// Simple SVG placeholder generator
function svgFor(path: string): string {
  const label = (path || 'Image').slice(0, 32)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#e5e7eb" />
      <stop offset="100%" stop-color="#f3f4f6" />
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <g fill="#9ca3af">
    <circle cx="600" cy="360" r="120" fill="#d1d5db"/>
    <rect x="380" y="500" width="440" height="40" rx="8"/>
  </g>
  <text x="50%" y="720" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#6b7280">${label}</text>
</svg>`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || ''
  const svg = svgFor(path)
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}



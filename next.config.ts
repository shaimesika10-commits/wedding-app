// ============================================================
//  GrandInvite – Next.js Configuration
//  next.config.ts
// ============================================================

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── Images ──────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        // Supabase Storage
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Google user photos (OAuth profile pictures)
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ── Security Headers ─────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control',   value: 'on' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      // Cache control for static assets
      {
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // ── Redirects ────────────────────────────────────────────────
  // NOTE: Root "/" redirect is intentionally omitted here.
  // The middleware (src/middleware.ts) handles it with smart language detection:
  // cookie → Accept-Language header → IP geolocation → default 'fr'
  async redirects() {
    return []
  },

  // ── Performance ──────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  // ── TypeScript ───────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: true,
  },

  // ── ESLint ───────────────────────────────────────────────────
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig

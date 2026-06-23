import type { NextConfig } from "next";

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '*.supabase.co'

const securityHeaders = [
  // Block browsers from guessing MIME types (XSS via crafted uploads)
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Deny embedding in iframes (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Don't send full Referer to external sites
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Only allow camera for the CNI scanner; block mic, geolocation, payment
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=()' },
  // Force HTTPS for 1 year (only applied on HTTPS responses by browsers)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js injects inline scripts during hydration — unsafe-inline required
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      // Tailwind / CSS-in-JS use inline styles
      "style-src 'self' 'unsafe-inline'",
      // Supabase REST + Realtime WebSocket
      `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST}`,
      // data: for CNI scanner preview (base64), blob: for PDF generation
      "img-src 'self' data: blob:",
      "media-src 'self' blob: data:",
      "font-src 'self' data:",
      // Service worker
      "worker-src 'self'",
      // No plugins, no embeds
      "object-src 'none'",
      // Prevent base tag hijacking
      "base-uri 'self'",
      // Only allow forms to submit to same origin
      "form-action 'self'",
      // Same as X-Frame-Options but CSP-native
      "frame-ancestors 'none'",
      // Auto-upgrade http:// links to https://
      "upgrade-insecure-requests",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig

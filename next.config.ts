import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Security Headers (Helmet-equivalent for Next.js) ──────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // XSS protection (legacy browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // DNS prefetch control
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // Permissions policy to restrict powerful features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Strict Transport Security (HSTS) - force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // needed for Next.js
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://registry.npmjs.org",
              "frame-src 'self' https://www.youtube.com https://youtube.com",
              "media-src 'self' https://www.youtube.com",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // ── Images ─────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },

  // ── External packages config ──────────────────────────────────────────────
  serverExternalPackages: ['mongoose', 'bcrypt'],
};

export default nextConfig;

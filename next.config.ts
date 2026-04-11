import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
    domains: ['localhost', 'vercel.com'],
    formats: ['image/avif', 'image/webp'],
  },

  redirects: async () => [],
  rewrites: async () => ({
    beforeFiles: [],
    afterFiles: [],
    fallback: [],
  }),
}

export default nextConfig

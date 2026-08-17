import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
    domains: ['localhost', 'vercel.com'],
    formats: ['image/avif', 'image/webp'],
  },

  redirects: async () => [
    {
      source: '/app-features',
      destination: '/features',
      permanent: true,
    },
    {
      source: '/partner-registration',
      destination: 'https://partners.thefurfinder.com/partner/signup',
      permanent: true,
    },
    {
      source: '/our-story',
      destination: '/about',
      permanent: true,
    },
  ],
  rewrites: async () => ({
    beforeFiles: [],
    afterFiles: [],
    fallback: [],
  }),
}

export default nextConfig

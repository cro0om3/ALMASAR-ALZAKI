/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  compress: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  
  // Performance optimizations
  reactStrictMode: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig

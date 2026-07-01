/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://menupro.ci/api/v1/:path*',
      },
    ]
  },
}

export default nextConfig

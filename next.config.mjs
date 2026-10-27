/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/search', destination: '/plan', permanent: false },
      { source: '/results', destination: '/plan', permanent: false },
      { source: '/wallet', destination: '/plan', permanent: false },
    ]
  },
}

export default nextConfig

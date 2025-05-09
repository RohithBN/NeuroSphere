/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.redd.it', 'preview.redd.it'],
  },
  //ignore build errors
  typescript: {
    ignoreBuildErrors: true,
  },
  //ignore eslint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
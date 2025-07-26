/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configurações para PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },

  // Configurações de imagens
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'sementesplay.vercel.app'],
    formats: ['image/webp', 'image/avif'],
  },

  // Configurações de compressão
  compress: true,

  // Configurações de performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Configurações de segurança
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // Configurações de build
  webpack: (config, { dev, isServer }) => {
    // Otimizações para PWA
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      }
    }

    return config
  },
}

module.exports = nextConfig 
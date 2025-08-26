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
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Configuração de CSP para resolver aviso de eval() e permitir imagens externas
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: https: http: blob:; font-src 'self' data: https://cdnjs.cloudflare.com; connect-src 'self' https:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
          },
        ],
      },
    ]
  },

  // Configurações de imagens corrigidas
  images: {
    domains: [
      'localhost', 
      'res.cloudinary.com', 
      'sementesplay.vercel.app', 
      'sementesplay.com.br', 
      'img.youtube.com',
      'static-cdn.jtvnw.net',
      'cdn.jtvnw.net',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
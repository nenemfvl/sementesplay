import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { username, storyId, preview } = req.query

  if (!username || !storyId) {
    return res.status(400).json({ error: 'Username e storyId são obrigatórios' })
  }

  try {
    // Se foi fornecido um preview via query parameter, redirecionar para ele
    if (preview && typeof preview === 'string') {
      return res.redirect(preview)
    }

    // Tentar buscar no banco de dados se existe um conteúdo com preview para este story
    const conteudo = await prisma.conteudo.findFirst({
      where: {
        url: {
          contains: `stories/${username}/${storyId}`
        },
        preview: {
          not: null
        }
      }
    })

    // Se encontrou um conteúdo com preview, redirecionar para a imagem real
    if (conteudo?.preview) {
      return res.redirect(conteudo.preview)
    }

    // Tentar algumas URLs comuns de imagem do Instagram
    const possibleImageUrls = [
      `https://scontent.cdninstagram.com/v/t51.2885-15/${storyId}`,
      `https://instagram.${username}.cdninstagram.com/v/t51.2885-15/${storyId}`,
    ]

    // Tentar buscar uma imagem real
    for (const imageUrl of possibleImageUrls) {
      try {
        const response = await fetch(imageUrl, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          return res.redirect(imageUrl)
        }
      } catch (e) {
        // Continue para a próxima URL
      }
    }

    // Se não conseguiu encontrar uma imagem real, criar um placeholder mais realista
    const placeholderSvg = `
      <svg width="400" height="711" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#833ab4;stop-opacity:1" />
            <stop offset="25%" style="stop-color:#fd1d1d;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#fcb045;stop-opacity:1" />
            <stop offset="75%" style="stop-color:#fd1d1d;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#833ab4;stop-opacity:1" />
          </linearGradient>
          <filter id="blur">
            <feGaussianBlur stdDeviation="2"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#instagramGradient)"/>
        
        <!-- Story frame (9:16 aspect ratio like real stories) -->
        <rect x="50" y="80" width="300" height="533" rx="20" fill="black" opacity="0.3"/>
        
        <!-- Profile circle at top -->
        <circle cx="200" cy="120" r="25" fill="white" opacity="0.9"/>
        <circle cx="200" cy="120" r="20" fill="url(#instagramGradient)"/>
        
        <!-- Username -->
        <text x="200" y="170" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">@${username}</text>
        
        <!-- Story content area -->
        <rect x="70" y="190" width="260" height="370" rx="10" fill="white" opacity="0.1"/>
        
        <!-- Instagram camera icon -->
        <g transform="translate(170, 320)">
          <circle r="30" fill="white" opacity="0.2"/>
          <rect x="-20" y="-15" width="40" height="30" rx="8" fill="white" opacity="0.8"/>
          <circle r="8" fill="white" opacity="0.6"/>
          <rect x="15" y="-20" width="8" height="8" rx="2" fill="white" opacity="0.8"/>
        </g>
        
        <!-- Story indicator dots -->
        <rect x="80" y="40" width="240" height="3" rx="1.5" fill="white" opacity="0.5"/>
        <rect x="80" y="40" width="60" height="3" rx="1.5" fill="white"/>
        
        <!-- Bottom text -->
        <text x="200" y="640" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" opacity="0.8">Instagram Story</text>
        <text x="200" y="665" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.6">Clique para ver no Instagram</text>
      </svg>
    `

    // Retornar o SVG como uma imagem
    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=1800') // Cache por 30 minutos
    return res.status(200).send(placeholderSvg)

  } catch (error) {
    console.error('Erro ao buscar imagem do story do Instagram:', error)
    
    // Em caso de erro, retornar um placeholder simples
    const errorSvg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#833ab4"/>
        <circle cx="200" cy="180" r="60" fill="white" opacity="0.2"/>
        <text x="200" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Instagram Story</text>
        <text x="200" y="230" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">@${username}</text>
        <text x="200" y="260" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.8">Imagem não disponível</text>
      </svg>
    `
    
    res.setHeader('Content-Type', 'image/svg+xml')
    return res.status(200).send(errorSvg)
  }
}

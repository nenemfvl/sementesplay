import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { username, storyId } = req.query

  if (!username || !storyId) {
    return res.status(400).json({ error: 'Username e storyId são obrigatórios' })
  }

  try {
    // Para stories do Instagram, é mais complexo obter a imagem diretamente
    // devido às políticas de privacidade e autenticação do Instagram.
    // Por enquanto, vamos redirecionar para um placeholder ou usar uma abordagem alternativa
    
    // Tentar algumas abordagens para obter a imagem do story
    const possibleUrls = [
      `https://www.instagram.com/stories/${username}/${storyId}/`,
      `https://instagram.com/stories/${username}/${storyId}/`,
    ]

    // Por limitações da API do Instagram, vamos retornar um placeholder personalizado
    // que pode ser melhorado futuramente com integração oficial da API do Instagram
    
    // Criar um SVG placeholder dinâmico para stories
    const placeholderSvg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#833ab4;stop-opacity:1" />
            <stop offset="25%" style="stop-color:#fd1d1d;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#fcb045;stop-opacity:1" />
            <stop offset="75%" style="stop-color:#fd1d1d;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#833ab4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#instagramGradient)"/>
        <circle cx="200" cy="180" r="60" fill="white" opacity="0.9"/>
        <rect x="140" y="120" width="120" height="120" rx="30" fill="none" stroke="white" stroke-width="8" opacity="0.9"/>
        <circle cx="240" cy="140" r="8" fill="white" opacity="0.9"/>
        <text x="200" y="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Instagram Story</text>
        <text x="200" y="310" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" opacity="0.8">@${username}</text>
        <text x="200" y="340" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.6">Story ID: ${storyId}</text>
      </svg>
    `

    // Retornar o SVG como uma imagem
    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache por 1 hora
    return res.status(200).send(placeholderSvg)

  } catch (error) {
    console.error('Erro ao buscar imagem do story do Instagram:', error)
    
    // Em caso de erro, retornar um placeholder simples
    const errorSvg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#833ab4"/>
        <text x="200" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24">Instagram Story</text>
        <text x="200" y="230" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">@${username}</text>
      </svg>
    `
    
    res.setHeader('Content-Type', 'image/svg+xml')
    return res.status(200).send(errorSvg)
  }
}

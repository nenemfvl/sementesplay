import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    // Tentar obter thumbnail via oEmbed do TikTok
    const oEmbedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
    
    const response = await fetch(oEmbedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`oEmbed failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.thumbnail_url) {
      return res.status(200).json({ 
        thumbnail: data.thumbnail_url,
        title: data.title || '',
        author: data.author_name || ''
      })
    }

    // Se oEmbed não retornar thumbnail, tentar extrair do HTML
    const htmlResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (htmlResponse.ok) {
      const html = await htmlResponse.text()
      
      // Procurar por meta tags de thumbnail
      const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i)
      const twitterImageMatch = html.match(/<meta name="twitter:image" content="([^"]+)"/i)
      
      const thumbnail = ogImageMatch?.[1] || twitterImageMatch?.[1]
      
      if (thumbnail) {
        return res.status(200).json({ 
          thumbnail: thumbnail,
          title: data.title || '',
          author: data.author_name || ''
        })
      }
    }

    return res.status(404).json({ error: 'Thumbnail not found' })

  } catch (error) {
    console.error('Error fetching TikTok thumbnail:', error)
    return res.status(500).json({ error: 'Failed to fetch thumbnail' })
  }
}

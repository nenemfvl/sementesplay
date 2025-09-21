import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).send('URL do Instagram é obrigatória.');
  }

  try {
    // Extrair ID do post do Instagram
    const insta = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
    if (!insta) {
      return res.status(400).send('URL do Instagram inválida.');
    }

    const postId = insta[1];

    // Tentar diferentes métodos para obter a thumbnail
    const thumbnailUrls = [
      // Método 1: URL direta (pode funcionar às vezes)
      `https://www.instagram.com/p/${postId}/media/?size=l`,
      // Método 2: URL alternativa
      `https://instagram.com/p/${postId}/media/?size=m`,
      // Método 3: oEmbed (se disponível)
      `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`,
    ];

    for (const thumbnailUrl of thumbnailUrls) {
      try {
        // Para oEmbed, fazer request e extrair thumbnail_url
        if (thumbnailUrl.includes('oembed')) {
          const oembedResponse = await axios.get(thumbnailUrl, {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (oembedResponse.data && oembedResponse.data.thumbnail_url) {
            return res.redirect(302, oembedResponse.data.thumbnail_url);
          }
        } else {
          // Para URLs diretas, tentar redirect
          const response = await axios.head(thumbnailUrl, {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (response.status === 200) {
            return res.redirect(302, thumbnailUrl);
          }
        }
      } catch (error) {
        // Continuar para próximo método
        continue;
      }
    }

    // Se todos os métodos falharam, retornar erro
    res.status(404).send('Thumbnail do Instagram não encontrada.');
  } catch (error) {
    console.error('Erro ao processar URL do Instagram:', error);
    res.status(500).send('Erro interno do servidor ao processar URL do Instagram.');
  }
}

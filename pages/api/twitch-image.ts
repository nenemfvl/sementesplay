import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).send('URL da Twitch é obrigatória.');
  }

  try {
    // Twitch Live Stream
    const twLive = url.match(/twitch\.tv\/([^/?]+)/);
    if (twLive && !url.includes('/videos/')) {
      const channelName = twLive[1];
      const thumbnailUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName}.jpg`;
      
      // Redirecionar para a URL da thumbnail real
      res.redirect(302, thumbnailUrl);
      return;
    }
    
    // Twitch Video
    const twVideo = url.match(/twitch\.tv\/videos\/(\d+)/);
    if (twVideo) {
      const videoId = twVideo[1];
      const thumbnailUrl = `https://static-cdn.jtvnw.net/v1/AUTH_system/vods/${videoId}/thumb/thumb0-320x240.jpg`;
      
      // Redirecionar para a URL da thumbnail real
      res.redirect(302, thumbnailUrl);
      return;
    }

    res.status(404).send('Formato de URL da Twitch não reconhecido.');
  } catch (error) {
    console.error('Erro ao processar URL da Twitch:', error);
    res.status(500).send('Erro interno do servidor ao processar URL da Twitch.');
  }
}

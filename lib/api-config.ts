// Configurações das APIs externas
export const API_CONFIG = {
  // YouTube API
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
  
  // Twitch API
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID || '',
  TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET || '',
  TWITCH_ACCESS_TOKEN: process.env.TWITCH_ACCESS_TOKEN || '',
  
  // Configurações gerais
  REQUEST_TIMEOUT: 10000, // 10 segundos
  MAX_RETRIES: 3
}

// Função para obter token de acesso da Twitch
export async function getTwitchAccessToken(): Promise<string> {
  if (API_CONFIG.TWITCH_ACCESS_TOKEN) {
    return API_CONFIG.TWITCH_ACCESS_TOKEN
  }
  
  if (!API_CONFIG.TWITCH_CLIENT_ID || !API_CONFIG.TWITCH_CLIENT_SECRET) {
    throw new Error('Twitch Client ID e Secret são necessários')
  }
  
  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: API_CONFIG.TWITCH_CLIENT_ID,
        client_secret: API_CONFIG.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    })
    
    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Erro ao obter token da Twitch:', error)
    throw error
  }
} 
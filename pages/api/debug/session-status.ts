import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('🔍 [DEBUG] Verificando status da sessão...')
    
    // Verificar todos os cookies recebidos
    const allCookies = req.cookies
    console.log('🍪 [DEBUG] Todos os cookies:', Object.keys(allCookies))
    
    // Verificar especificamente o cookie do usuário
    const userCookie = req.cookies['sementesplay_user']
    const tokenCookie = req.cookies['token']
    
    console.log('🍪 [DEBUG] Cookie sementesplay_user:', userCookie ? 'EXISTE' : 'NÃO EXISTE')
    console.log('🍪 [DEBUG] Cookie token:', tokenCookie ? 'EXISTE' : 'NÃO EXISTE')
    
    if (userCookie) {
      console.log('🍪 [DEBUG] Cookie do usuário (primeiros 200 chars):', userCookie.substring(0, 200))
    }
    
    // Tentar decodificar o cookie do usuário
    let decodedUser = null
    if (userCookie) {
      try {
        decodedUser = JSON.parse(decodeURIComponent(userCookie))
        console.log('✅ [DEBUG] Usuário decodificado:', { 
          id: decodedUser.id, 
          nome: decodedUser.nome, 
          email: decodedUser.email,
          tipo: decodedUser.tipo
        })
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao decodificar cookie:', error)
      }
    }
    
    // Verificar headers da requisição
    console.log('📡 [DEBUG] Headers relevantes:')
    console.log('   - User-Agent:', req.headers['user-agent']?.substring(0, 100))
    console.log('   - Origin:', req.headers['origin'])
    console.log('   - Referer:', req.headers['referer'])
    console.log('   - Cookie header:', req.headers['cookie'] ? 'EXISTE' : 'NÃO EXISTE')
    
    if (req.headers['cookie']) {
      console.log('🍪 [DEBUG] Cookie header (primeiros 200 chars):', req.headers['cookie'].substring(0, 200))
    }

    return res.status(200).json({
      success: true,
      debug: {
        cookiesReceived: Object.keys(allCookies),
        hasSementsplayUser: !!userCookie,
        hasToken: !!tokenCookie,
        userDecoded: !!decodedUser,
        userData: decodedUser ? {
          id: decodedUser.id,
          nome: decodedUser.nome,
          email: decodedUser.email,
          tipo: decodedUser.tipo
        } : null,
        headers: {
          userAgent: req.headers['user-agent']?.substring(0, 100),
          origin: req.headers['origin'],
          referer: req.headers['referer'],
          hasCookieHeader: !!req.headers['cookie']
        }
      }
    })

  } catch (error) {
    console.error('❌ [DEBUG] Erro no debug da sessão:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}

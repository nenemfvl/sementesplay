import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('🔍 [USUARIO/ATUAL] Verificando autenticação...')
    console.log('🍪 [USUARIO/ATUAL] Cookies recebidos:', Object.keys(req.cookies))
    console.log('📡 [USUARIO/ATUAL] Headers Authorization:', req.headers.authorization ? 'EXISTS' : 'NOT EXISTS')
    
    let userId = null
    
    // Primeiro, tentar obter do cookie
    const userCookie = req.cookies['sementesplay_user']
    console.log('🍪 [USUARIO/ATUAL] Cookie sementesplay_user:', userCookie ? 'EXISTS' : 'NOT EXISTS')
    
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie))
        userId = userData.id
        console.log('✅ [USUARIO/ATUAL] Usuário do cookie:', userData.nome)
      } catch (error) {
        console.error('❌ [USUARIO/ATUAL] Erro ao decodificar cookie:', error)
      }
    }
    
    // Se não conseguiu do cookie, tentar do header Authorization
    if (!userId && req.headers.authorization) {
      try {
        const authHeader = req.headers.authorization
        console.log('🔑 [USUARIO/ATUAL] Tentando autenticação via header...')
        
        if (authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7)
          // Aqui você pode validar o JWT se necessário
          console.log('🔑 [USUARIO/ATUAL] Token recebido via header')
        } else if (authHeader.startsWith('User ')) {
          // Formato personalizado: "User {userId}"
          userId = authHeader.substring(5)
          console.log('✅ [USUARIO/ATUAL] UserId do header:', userId)
        }
      } catch (error) {
        console.error('❌ [USUARIO/ATUAL] Erro ao processar header Authorization:', error)
      }
    }

    if (!userId) {
      console.log('❌ [USUARIO/ATUAL] Nenhuma autenticação válida encontrada')
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        debug: {
          cookiesReceived: Object.keys(req.cookies),
          hasAuthHeader: !!req.headers.authorization,
          userAgent: req.headers['user-agent']
        }
      })
    }
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        criador: true,
        parceiro: true
      }
    })

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    // Retornar dados do usuário sem a senha
    const { senha, ...usuarioSemSenha } = usuario

    res.status(200).json({ 
      usuario: usuarioSemSenha,
      autenticado: true 
    })
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
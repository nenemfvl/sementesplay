import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Tentar obter o usuário do cookie de sessão
    let userId: string | null = null
    const userCookie = req.cookies['sementesplay_user']
    
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie))
        userId = userData.id
      } catch (error) {
        console.error('Erro ao decodificar cookie do usuário:', error)
      }
    }

    // Se não autenticado via cookie, tentar via header Authorization
    if (!userId && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith('User ')) {
        userId = authHeader.substring(5)
      }
    }

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
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
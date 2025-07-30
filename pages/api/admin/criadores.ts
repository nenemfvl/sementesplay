import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('🔍 Buscando criadores...')
    console.log('🍪 Cookies:', req.cookies)
    console.log('📋 Headers:', req.headers)

    // Verificar autenticação - tentar cookie primeiro, depois header
    let user = null
    let authMethod = ''

    // Método 1: Cookie
    const userCookie = req.cookies.sementesplay_user
    if (userCookie) {
      try {
        user = JSON.parse(decodeURIComponent(userCookie))
        authMethod = 'cookie'
        console.log('✅ Usuário autenticado via cookie:', { id: user.id, nome: user.nome, nivel: user.nivel })
      } catch (error) {
        console.log('❌ Erro ao decodificar cookie:', error)
      }
    }

    // Método 2: Header Authorization (fallback)
    if (!user && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '')
        user = JSON.parse(decodeURIComponent(token))
        authMethod = 'header'
        console.log('✅ Usuário autenticado via header:', { id: user.id, nome: user.nome, nivel: user.nivel })
      } catch (error) {
        console.log('❌ Erro ao decodificar header:', error)
      }
    }

    if (!user) {
      console.log('❌ Nenhum método de autenticação válido encontrado')
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Verificar se é admin
    if (Number(user.nivel) < 5) {
      console.log('❌ Usuário não é admin. Nível:', user.nivel)
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta área.' })
    }

    console.log(`✅ Usuário autenticado e autorizado via ${authMethod}`)

    // Buscar criadores
    const criadores = await prisma.criador.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true,
            dataCriacao: true
          }
        }
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    })

    console.log(`📊 Encontrados ${criadores.length} criadores`)

    // Formatar dados
    const criadoresFormatados = criadores.map(criador => ({
      id: criador.id,
      nome: criador.usuario.nome,
      email: criador.usuario.email,
      nivel: criador.nivel,
      doacoesRecebidas: criador.doacoes || 0,
      apoiadores: criador.apoiadores || 0,
      favoritos: 0, // Campo não existe no schema
      status: 'ativo', // Campo não existe no schema
      dataCriacao: criador.dataCriacao
    }))

    return res.status(200).json({ criadores: criadoresFormatados })
  } catch (error) {
    console.error('❌ Erro ao buscar criadores:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
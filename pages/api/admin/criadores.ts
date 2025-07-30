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

    // Verificar autenticação
    const userCookie = req.cookies.sementesplay_user
    console.log('👤 User cookie:', userCookie)

    if (!userCookie) {
      console.log('❌ Cookie de usuário não encontrado')
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    let user
    try {
      user = JSON.parse(decodeURIComponent(userCookie))
      console.log('✅ Usuário decodificado:', { id: user.id, nome: user.nome, nivel: user.nivel })
    } catch (error) {
      console.log('❌ Erro ao decodificar cookie:', error)
      return res.status(401).json({ error: 'Cookie inválido' })
    }

    // Verificar se é admin
    if (Number(user.nivel) < 5) {
      console.log('❌ Usuário não é admin. Nível:', user.nivel)
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta área.' })
    }

    console.log('✅ Usuário autenticado e autorizado')

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
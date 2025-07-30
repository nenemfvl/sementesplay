import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id } = req.query

  try {
    console.log('🔍 Suspender criador:', id)

    // Verificar autenticação
    const userCookie = req.cookies.sementesplay_user
    if (!userCookie) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    let user
    try {
      user = JSON.parse(decodeURIComponent(userCookie))
    } catch (error) {
      return res.status(401).json({ error: 'Cookie inválido' })
    }

    // Verificar se é admin
    if (Number(user.nivel) < 5) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta área.' })
    }

    // Buscar o criador
    const criador = await prisma.criador.findUnique({
      where: { id: String(id) },
      include: { usuario: true }
    })

    if (!criador) {
      return res.status(404).json({ error: 'Criador não encontrado' })
    }

    // Atualizar o nível do usuário para "comum" (remover status de criador)
    await prisma.usuario.update({
      where: { id: criador.usuarioId },
      data: { nivel: 'comum' }
    })

    console.log(`✅ Criador ${criador.usuario.nome} removido com sucesso`)

    return res.status(200).json({ 
      message: 'Criador removido com sucesso',
      criador: {
        id: criador.id,
        nome: criador.usuario.nome,
        nivel: 'comum'
      }
    })

  } catch (error) {
    console.error('❌ Erro ao suspender criador:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
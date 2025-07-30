import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { auth } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Verificar autenticação
    const user = auth.getUser()
    if (!user) {
      return res.status(401).json({ error: 'Não autorizado' })
    }

    // Verificar se é admin
    if (Number(user.nivel) < 5) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

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

    // Formatar dados
    const criadoresFormatados = criadores.map(criador => ({
      id: criador.id,
      nome: criador.usuario.nome,
      email: criador.usuario.email,
      nivel: criador.nivel,
      doacoesRecebidas: criador.doacoesRecebidas || 0,
      apoiadores: criador.apoiadores || 0,
      favoritos: criador.favoritos || 0,
      status: criador.status || 'ativo',
      dataCriacao: criador.dataCriacao
    }))

    return res.status(200).json({ criadores: criadoresFormatados })
  } catch (error) {
    console.error('Erro ao buscar criadores:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
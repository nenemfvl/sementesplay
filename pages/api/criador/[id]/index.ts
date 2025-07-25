import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do criador é obrigatório' })
  }

  try {
    // Buscar o criador com dados do usuário
    const criador = await prisma.criador.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
            nivel: true
          }
        },
        doacoesRecebidas: {
          select: {
            id: true,
            quantidade: true
          }
        }
      }
    })

    if (!criador) {
      return res.status(404).json({ error: 'Criador não encontrado' })
    }

    // Calcular estatísticas
    const totalSementes = criador.doacoesRecebidas.reduce((sum, doacao) => sum + doacao.quantidade, 0)
    const numeroDoacoes = criador.doacoesRecebidas.length

    // Buscar posição no ranking
    const ranking = await prisma.$queryRaw`
      SELECT 
        c.id,
        COALESCE(SUM(d.quantidade), 0) as totalDoacoes
      FROM criadores c
      LEFT JOIN doacoes d ON c.id = d.criadorId
      GROUP BY c.id
      ORDER BY totalDoacoes DESC
    ` as any[]

    const posicao = ranking.findIndex(item => item.id === id) + 1

    // Parsear redes sociais do JSON string
    let redesSociais = {}
    try {
      redesSociais = JSON.parse(criador.redesSociais || '{}')
    } catch (e) {
      redesSociais = {}
    }

    // Formatar dados para o frontend
    const criadorFormatado = {
      id: criador.id,
      nome: criador.usuario.nome,
      nivel: criador.usuario.nivel,
      avatar: criador.usuario.avatarUrl,
      bio: criador.bio,
      sementes: totalSementes,
      apoiadores: criador.apoiadores || 0,
      doacoes: numeroDoacoes,
      posicao: posicao,
      redesSociais: redesSociais
    }

    res.status(200).json({ criador: criadorFormatado })
  } catch (error) {
    console.error('Erro ao buscar dados do criador:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
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

  console.log('API criador: Buscando criador com ID:', id)

  try {
    // Buscar o criador com dados básicos primeiro
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
        }
      }
    })

    console.log('API criador: Criador encontrado:', criador ? 'SIM' : 'NÃO')

    if (!criador) {
      console.log('API criador: Criador não encontrado para ID:', id)
      return res.status(404).json({ error: 'Criador não encontrado' })
    }

    console.log('API criador: Processando dados do criador...')

    // Buscar doações separadamente para evitar problemas
    const doacoes = await prisma.doacao.findMany({
      where: { criadorId: id },
      select: {
        id: true,
        quantidade: true
      }
    })

    console.log('API criador: Doações encontradas:', doacoes.length)

    // Calcular estatísticas
    const totalSementes = doacoes.reduce((sum, doacao) => sum + doacao.quantidade, 0)
    const numeroDoacoes = doacoes.length

    console.log('API criador: Estatísticas calculadas - Sementes:', totalSementes, 'Doações:', numeroDoacoes)

    // Buscar posição no ranking de forma mais simples
    const ranking = await prisma.criador.findMany({
      select: {
        id: true
      },
      orderBy: {
        sementes: 'desc'
      }
    })

    const posicao = ranking.findIndex(item => item.id === id) + 1

    console.log('API criador: Posição no ranking:', posicao)

    // Parsear redes sociais do JSON string
    let redesSociais = {}
    try {
      redesSociais = JSON.parse(criador.redesSociais || '{}')
    } catch (e) {
      console.log('API criador: Erro ao parsear redes sociais:', e)
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

    console.log('API criador: Dados formatados com sucesso')

    res.status(200).json({ criador: criadorFormatado })
  } catch (error) {
    console.error('Erro ao buscar dados do criador:', error)
    console.error('Detalhes do erro:', error.message)
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message })
  }
} 
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
    // Buscar o criador primeiro para verificar se existe
    const criador = await prisma.criador.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    })

    if (!criador) {
      return res.status(404).json({ error: 'Criador não encontrado' })
    }

    // Buscar as doações mais recentes para este criador
    const doacoes = await prisma.doacao.findMany({
      where: {
        criadorId: id
      },
      include: {
        doador: {
          select: {
            id: true,
            nome: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        dataCriacao: 'desc'
      },
      take: 10 // Limitar a 10 doações mais recentes
    })

    // Formatar os dados para o frontend
    const doacoesFormatadas = doacoes.map(doacao => ({
      id: doacao.id,
      usuario: doacao.doador.nome,
      valor: doacao.quantidade,
      data: doacao.dataCriacao.toISOString().split('T')[0], // Formato YYYY-MM-DD
      mensagem: doacao.mensagem || null,
      avatarUrl: doacao.doador.avatarUrl
    }))

    res.status(200).json({ doacoes: doacoesFormatadas })
  } catch (error) {
    console.error('Erro ao buscar doações do criador:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
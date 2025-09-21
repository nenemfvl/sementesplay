import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: criadorId } = req.query
  
  if (!criadorId || typeof criadorId !== 'string') {
    return res.status(400).json({ error: 'ID do criador é obrigatório' })
  }

  try {
    if (req.method === 'POST') {
      // Adicionar aos favoritos
      const { usuarioId } = req.body
      
      if (!usuarioId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' })
      }

      // Verificar se o criador existe
      const criador = await prisma.criador.findUnique({
        where: { id: criadorId }
      })

      if (!criador) {
        return res.status(404).json({ error: 'Criador não encontrado' })
      }

      // Verificar se já está favoritado (simular tabela)
      // Por enquanto, vamos criar uma entrada na tabela de sementes para rastrear
      const jaFavoritado = await prisma.semente.findFirst({
        where: {
          usuarioId: usuarioId,
          tipo: 'favorito_criador',
          descricao: `Favoritou criador ${criadorId}`
        }
      })

      if (jaFavoritado) {
        return res.status(400).json({ error: 'Criador já está favoritado' })
      }

      // Criar registro de favorito
      await prisma.semente.create({
        data: {
          usuarioId: usuarioId,
          quantidade: 0, // Não altera sementes
          tipo: 'favorito_criador',
          descricao: `Favoritou criador ${criadorId}`
        }
      })

      return res.status(200).json({ success: true, message: 'Criador favoritado' })
      
    } else if (req.method === 'DELETE') {
      // Remover dos favoritos
      const { usuarioId } = req.body
      
      if (!usuarioId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' })
      }

      // Remover registro de favorito
      await prisma.semente.deleteMany({
        where: {
          usuarioId: usuarioId,
          tipo: 'favorito_criador',
          descricao: `Favoritou criador ${criadorId}`
        }
      })

      return res.status(200).json({ success: true, message: 'Criador removido dos favoritos' })
      
    } else if (req.method === 'GET') {
      // Contar total de favoritos para este criador
      const totalFavoritos = await prisma.semente.count({
        where: {
          tipo: 'favorito_criador',
          descricao: `Favoritou criador ${criadorId}`
        }
      })

      return res.status(200).json({ totalFavoritos })
      
    } else {
      return res.status(405).json({ error: 'Método não permitido' })
    }
    
  } catch (error) {
    console.error('Erro na API de favoritos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

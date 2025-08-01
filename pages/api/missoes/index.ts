import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query

      if (!usuarioId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' })
      }

      // Buscar missões ativas
      const missoes = await prisma.missao.findMany({
        where: {
          ativa: true
        },
        include: {
          usuarios: {
            where: {
              usuarioId: String(usuarioId)
            }
          }
        },
        orderBy: {
          dataInicio: 'desc'
        }
      })

      const missoesFormatadas = missoes.map(missao => {
        const missaoUsuario = missao.usuarios[0]
        
        return {
          id: missao.id,
          titulo: missao.titulo,
          descricao: missao.descricao,
          tipo: missao.tipo,
          objetivo: missao.recompensa, // Usar recompensa como objetivo
          recompensa: missao.recompensa,
          progresso: missaoUsuario?.progresso || 0,
          completada: missaoUsuario?.concluida || false,
          reivindicada: missaoUsuario?.concluida || false, // Mockado por enquanto
          dataCompletada: missaoUsuario?.dataConclusao,
          dataReivindicada: missaoUsuario?.dataConclusao, // Mockado por enquanto
          icone: '🎯', // Mockado por enquanto
          cor: 'blue', // Mockado por enquanto
          categoria: missao.tipo // Usar tipo como categoria
        }
      })

      return res.status(200).json({ missoes: missoesFormatadas })
    } catch (error) {
      console.error('Erro ao buscar missões:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 
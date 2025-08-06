import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
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
        orderBy: {
          dataInicio: 'desc'
        }
      })

      // Buscar progresso do usuário em todas as missões
      const progressosUsuario = await prisma.missaoUsuario.findMany({
        where: {
          usuarioId: String(usuarioId)
        }
      })

      const missoesFormatadas = missoes.map(missao => {
        const missaoUsuario = progressosUsuario.find(p => p.missaoId === missao.id)
        
        return {
          id: missao.id,
          titulo: missao.titulo,
          descricao: missao.descricao,
          tipo: missao.tipo,
          objetivo: missao.objetivo,
          recompensa: missao.recompensa,
          progresso: missaoUsuario?.progresso || 0,
          completada: missaoUsuario?.concluida || false,
          reivindicada: missaoUsuario?.reivindicada || false,
          dataCompletada: missaoUsuario?.dataConclusao,
          dataReivindicada: missaoUsuario?.dataConclusao,
          icone: missao.emblema || '🎯',
          cor: 'blue',
          categoria: missao.tipo
        }
      })

      return res.status(200).json({ missoes: missoesFormatadas })
    } catch (error) {
      // COMENTADO: Log de debug - não afeta funcionalidade
      // console.error('Erro ao buscar missões:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 
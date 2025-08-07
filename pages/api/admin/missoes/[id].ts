import { prisma } from '../../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const { titulo, descricao, objetivo, recompensa, tipo, ativa, emblema } = req.body

      if (!titulo || !descricao || !objetivo || !recompensa || !tipo) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
      }

      // Atualizar missão
      const missaoAtualizada = await prisma.missao.update({
        where: { id: String(id) },
        data: {
          titulo,
          descricao,
          objetivo,
          recompensa: parseInt(recompensa),
          tipo,
          ativa: ativa || false,
          emblema: emblema || null
        }
      })

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: 'system',
          acao: 'EDITAR_MISSAO',
          detalhes: `Missão editada. ID: ${id}, Título: ${titulo}, Tipo: ${tipo}, Recompensa: ${recompensa} sementes, Ativa: ${ativa || false}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
        }
      })

      return res.status(200).json({ 
        message: 'Missão atualizada com sucesso',
        missao: missaoAtualizada 
      })
    } catch (error) {
      console.error('Erro ao atualizar missão:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Deletar missão
      await prisma.missao.delete({
        where: { id: String(id) }
      })

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: 'system',
          acao: 'DELETAR_MISSAO',
          detalhes: `Missão deletada. ID: ${id}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
        }
      })

      return res.status(200).json({ message: 'Missão deletada com sucesso' })
    } catch (error) {
      console.error('Erro ao deletar missão:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}

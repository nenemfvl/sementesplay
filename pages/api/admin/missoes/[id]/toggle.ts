import { prisma } from '../../../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id } = req.query

  try {
    // Buscar missão atual
    const missaoAtual = await prisma.missao.findUnique({
      where: { id: String(id) }
    })

    if (!missaoAtual) {
      return res.status(404).json({ error: 'Missão não encontrada' })
    }

    // Alternar status
    const novaMissao = await prisma.missao.update({
      where: { id: String(id) },
      data: {
        ativa: !missaoAtual.ativa
      }
    })

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: 'system',
        acao: 'ALTERAR_STATUS_MISSAO',
        detalhes: `Status da missão alterado. ID: ${id}, Título: ${missaoAtual.titulo}, Novo status: ${novaMissao.ativa ? 'Ativa' : 'Inativa'}`,
        ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
        nivel: 'info'
      }
    })

    return res.status(200).json({ 
      message: `Missão ${novaMissao.ativa ? 'ativada' : 'desativada'} com sucesso`,
      missao: novaMissao 
    })
  } catch (error) {
    console.error('Erro ao alterar status da missão:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

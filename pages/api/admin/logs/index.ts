import { prisma } from '../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar logs reais da tabela logs_auditoria
    const logs = await prisma.logAuditoria.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100 // Limitar a 100 logs mais recentes
    })

    // Formatar os dados para o frontend
    const logsFormatados = logs.map(log => ({
      id: log.id,
      usuarioId: log.usuarioId,
      usuarioNome: log.usuario?.nome || 'Usuário não encontrado',
      acao: log.acao,
      detalhes: log.detalhes,
      ip: log.ip || 'N/A',
      userAgent: log.userAgent || 'N/A',
      timestamp: log.timestamp,
      nivel: log.nivel
    }))

    return res.status(200).json({ logs: logsFormatados })
  } catch (error) {
    // COMENTADO: Log de debug - não afeta funcionalidade
    // console.error('Erro ao buscar logs:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
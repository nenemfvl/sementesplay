import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { denunciaId, acao } = req.body

    if (!denunciaId || !acao) {
      return res.status(400).json({ error: 'ID da denúncia e ação são obrigatórios' })
    }

    if (!['aprovar', 'rejeitar'].includes(acao)) {
      return res.status(400).json({ error: 'Ação deve ser "aprovar" ou "rejeitar"' })
    }

    // Buscar a denúncia
    const denuncia = await prisma.denuncia.findUnique({
      where: { id: denunciaId },
      include: {
        conteudo: true,
        conteudoParceiro: true
      }
    })

    if (!denuncia) {
      return res.status(404).json({ error: 'Denúncia não encontrada' })
    }

    // Atualizar status da denúncia
    const novoStatus = acao === 'aprovar' ? 'resolvida' : 'rejeitada'
    
    await prisma.denuncia.update({
      where: { id: denunciaId },
      data: {
        status: novoStatus,
        dataResolucao: new Date()
      }
    })

    // Se aprovada, pode-se tomar ações adicionais (ex: remover conteúdo, suspender usuário, etc.)
    if (acao === 'aprovar') {
      // Aqui você pode implementar ações adicionais
      // Por exemplo: remover conteúdo, suspender criador/parceiro, etc.
      console.log(`Denúncia aprovada: ${denunciaId}`)
    }

    return res.status(200).json({ 
      success: true, 
      message: `Denúncia ${acao === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso` 
    })

  } catch (error) {
    console.error('Erro ao processar denúncia:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

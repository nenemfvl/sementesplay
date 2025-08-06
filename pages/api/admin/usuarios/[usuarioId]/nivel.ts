import { prisma } from '../../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query
    const { nivel } = req.body

    if (!usuarioId || !nivel) {
      return res.status(400).json({ error: 'ID do usuário e nível são obrigatórios' })
    }

    // Validar nível
    const niveisValidos = ['comum', 'parceiro', 'supremo']
    if (!niveisValidos.includes(nivel)) {
      return res.status(400).json({ error: 'Nível inválido' })
    }

    // Buscar usuário atual para comparar
    const usuarioAtual = await prisma.usuario.findUnique({
      where: { id: String(usuarioId) }
    })

    if (!usuarioAtual) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Atualizar usuário
    const usuario = await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { nivel: String(nivel) }
    })

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: 'system', // Sistema
        acao: 'ALTERAR_NIVEL_USUARIO',
        detalhes: `Nível do usuário ${usuarioId} (${usuarioAtual.nome}) alterado de ${usuarioAtual.nivel} para ${nivel}`,
        ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
        nivel: 'warning'
      }
    })

    return res.status(200).json({ 
      message: 'Nível alterado com sucesso',
      usuario
    })
  } catch (error) {
    console.error('Erro ao alterar nível:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
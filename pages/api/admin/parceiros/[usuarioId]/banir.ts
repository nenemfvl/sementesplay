import { prisma } from '../../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/pages/api/utils/auth-backend';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const user = getUserFromToken(req);
    if (!user || Number(user.nivel) < 5) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const { usuarioId } = req.query;
    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }
    // Atualizar status do usuário para banido
    await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { nivel: 'banido', tipo: 'banido' }
    });
    const { motivo } = req.body;

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: user.id,
        acao: 'BANIR_PARCEIRO',
        detalhes: `Parceiro ${usuarioId} banido pelo admin ${user.nome}. Motivo: ${motivo || 'Não informado'}`,
        nivel: 'warning'
      }
    });

    // Enviar notificação ao parceiro banido
    await prisma.notificacao.create({
      data: {
        usuarioId: String(usuarioId),
        titulo: 'Conta Banida',
        mensagem: `Sua conta de parceiro foi banida pela administração. Motivo: ${motivo || 'Violação dos termos de uso'}`,
        tipo: 'sistema',
        lida: false
      }
    });
    res.status(200).json({ message: 'Parceiro banido com sucesso' });
  } catch (error) {
    console.error('Erro ao banir parceiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 
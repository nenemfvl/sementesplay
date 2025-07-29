import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
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
    const { motivo } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: String(usuarioId) }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se o usuário está banido ou suspenso
    if (usuario.nivel !== 'banido' && usuario.nivel !== 'suspenso') {
      return res.status(400).json({ error: 'Usuário não está banido ou suspenso' });
    }

    // Reativar usuário (voltar para comum)
    await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { 
        nivel: 'comum',
        tipo: 'usuario'
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: user.id,
        acao: 'REATIVAR_USUARIO',
        detalhes: `Usuário ${usuarioId} (${usuario.nome}) reativado pelo admin ${user.nome}. Motivo: ${motivo || 'Reavaliação da administração'}`,
        nivel: 'info'
      }
    });

    // Enviar notificação ao usuário reativado
    await prisma.notificacao.create({
      data: {
        usuarioId: String(usuarioId),
        titulo: 'Conta Reativada',
        mensagem: `Sua conta foi reativada pela administração. Motivo: ${motivo || 'Reavaliação da administração'}`,
        tipo: 'sistema',
        lida: false
      }
    });

    res.status(200).json({ 
      success: true,
      message: 'Usuário reativado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao reativar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 
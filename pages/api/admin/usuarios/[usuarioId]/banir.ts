import { prisma } from '../../../../../lib/prisma'

import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/pages/api/utils/auth-backend';
import { PermissionsManager } from '../../../../../lib/permissions-manager';

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

    // Remover permissões especiais se existirem
    if (usuario.nivel !== 'comum') {
      if (['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo'].includes(usuario.nivel)) {
        await PermissionsManager.removeCriadorPermissions(String(usuarioId));
      } else if (usuario.nivel === 'parceiro') {
        await PermissionsManager.removeParceiroPermissions(String(usuarioId));
      } else if (usuario.nivel === '5') {
        await PermissionsManager.removeAdminPermissions(String(usuarioId));
      }
    }

    // Atualizar status do usuário para banido
    await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { 
        nivel: 'banido',
        tipo: 'banido'
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: user.id,
        acao: 'BANIR_USUARIO',
        detalhes: `Usuário ${usuarioId} (${usuario.nome}) banido pelo admin ${user.nome}. Motivo: ${motivo || 'Não informado'}`,
        nivel: 'warning'
      }
    });

    // Enviar notificação ao usuário banido
    await prisma.notificacao.create({
      data: {
        usuarioId: String(usuarioId),
        titulo: 'Conta Banida',
        mensagem: `Sua conta foi banida pela administração. Motivo: ${motivo || 'Violação dos termos de uso'}`,
        tipo: 'sistema',
        lida: false
      }
    });

    res.status(200).json({ 
      success: true,
      message: 'Usuário banido com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao banir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 
import { prisma } from '../../../../../lib/prisma'

import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/pages/api/utils/auth-backend';
import { PermissionsManager } from '../../../../../lib/permissions-manager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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
    // Remover registro de parceiro
    await prisma.parceiro.delete({
      where: { usuarioId: String(usuarioId) }
    });
    
    // Remover candidatura de parceiro (se existir)
    await prisma.candidaturaParceiro.deleteMany({
      where: { usuarioId: String(usuarioId) }
    });
    
    // Atualizar nível do usuário para 'comum'
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { nivel: 'comum' }
    });
    
    // Remover permissões usando o PermissionsManager
    await PermissionsManager.removeParceiroPermissions(String(usuarioId));
    const { motivo } = req.body;

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: user.id,
        acao: 'REMOVER_PARCEIRO',
        detalhes: `Parceiro ${usuarioId} removido pelo admin ${user.nome}. Motivo: ${motivo || 'Não informado'}`,
        nivel: 'warning'
      }
    });

    // Enviar notificação ao parceiro removido
    await prisma.notificacao.create({
      data: {
        usuarioId: String(usuarioId),
        titulo: 'Status de Parceiro Removido',
        mensagem: `Seu status de parceiro foi removido pela administração. Motivo: ${motivo || 'Reavaliação da administração'}`,
        tipo: 'sistema',
        lida: false
      }
    });
    res.status(200).json({ 
      message: 'Parceiro removido com sucesso',
      usuarioAtualizado: {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        nivel: usuarioAtualizado.nivel,
        tipo: usuarioAtualizado.tipo
      }
    });
  } catch (error) {
    console.error('Erro ao remover parceiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 
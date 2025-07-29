import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/pages/api/utils/auth-backend';
import { PermissionsManager } from '../../../../../lib/permissions-manager';

const prisma = new PrismaClient();

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
    
    // Remover permissões usando o PermissionsManager
    await PermissionsManager.removeParceiroPermissions(String(usuarioId));
    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: user.id,
        acao: 'REMOVER_PARCEIRO',
        detalhes: `Parceiro ${usuarioId} removido pelo admin ${user.nome}`,
        nivel: 'warning'
      }
    });
    res.status(200).json({ message: 'Parceiro removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover parceiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 
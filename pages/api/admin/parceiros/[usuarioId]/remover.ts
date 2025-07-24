import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { auth } from '../../../../lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const user = auth.getUser();
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
    // Atualizar usuário para comum
    await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { nivel: 'comum', tipo: 'comum' }
    });
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
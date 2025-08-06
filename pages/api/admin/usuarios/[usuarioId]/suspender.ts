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
    const { motivo, duracao } = req.body; // duracao em dias

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

    // Calcular data de fim da suspensão
    const dataFimSuspensao = new Date();
    dataFimSuspensao.setDate(dataFimSuspensao.getDate() + (duracao || 7)); // padrão 7 dias

    // Atualizar status do usuário para suspenso
    await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: { 
        nivel: 'suspenso',
        tipo: 'suspenso'
      }
    });

    // Criar registro de suspensão
    await prisma.logAuditoria.create({
      data: {
        usuarioId: user.id,
        acao: 'SUSPENDER_USUARIO',
        detalhes: `Usuário ${usuarioId} (${usuario.nome}) suspenso pelo admin ${user.nome}. Motivo: ${motivo || 'Não informado'}. Duração: ${duracao || 7} dias. Fim: ${dataFimSuspensao.toISOString()}`,
        nivel: 'warning'
      }
    });

    // Enviar notificação ao usuário suspenso
    await prisma.notificacao.create({
      data: {
        usuarioId: String(usuarioId),
        titulo: 'Conta Suspensa',
        mensagem: `Sua conta foi suspensa por ${duracao || 7} dias. Motivo: ${motivo || 'Violação dos termos de uso'}. Suspensão termina em: ${dataFimSuspensao.toLocaleDateString('pt-BR')}`,
        tipo: 'sistema',
        lida: false
      }
    });

    res.status(200).json({ 
      success: true,
      message: 'Usuário suspenso com sucesso',
      dataFimSuspensao: dataFimSuspensao
    });

  } catch (error) {
    console.error('Erro ao suspender usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 
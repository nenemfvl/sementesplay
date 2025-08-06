import { prisma } from '../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { usuarioId } = req.query;
    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }
    const candidatura = await prisma.candidaturaParceiro.findFirst({
      where: { usuarioId: String(usuarioId) },
      orderBy: { dataCandidatura: 'desc' }
    });
    if (!candidatura) {
      return res.status(200).json({ status: null });
    }
    res.status(200).json({ status: candidatura.status, candidatura });
  } catch (error) {
    console.error('Erro ao buscar status da candidatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 
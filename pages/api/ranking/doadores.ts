import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificar autenticação via token Bearer
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const userId = authHeader.replace('Bearer ', '');
    
    // Verificar se o usuário existe
    const user = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se o usuário é criador
    const criador = await prisma.criador.findFirst({
      where: { usuarioId: userId }
    });

    if (!criador) {
      return res.status(403).json({ error: 'Apenas criadores podem acessar ranking de doadores' });
    }

    // Buscar ranking de doadores para este criador
    const rankingDoadores = await prisma.$queryRaw`
      SELECT 
        d.doadorId,
        u.nome,
        SUM(d.quantidade) as total
      FROM Doacao d
      JOIN Usuario u ON d.doadorId = u.id
      WHERE d.criadorId = ${criador.id}
      GROUP BY d.doadorId, u.nome
      ORDER BY total DESC
      LIMIT 10
    `;

    // Formatar resultado
    const rankingFormatado = (rankingDoadores as any[]).map((item, index) => ({
      id: item.doadorId,
      nome: item.nome,
      total: Number(item.total),
      posicao: index + 1
    }));

    return res.status(200).json(rankingFormatado);
  } catch (error) {
    console.error('Erro ao buscar ranking de doadores:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 
import { prisma } from '../../../lib/prisma'

import { NextApiRequest, NextApiResponse } from 'next';
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

    // Buscar ranking de doadores para este criador usando Prisma ORM
    const doacoes = await prisma.doacao.findMany({
      where: {
        criadorId: criador.id
      },
      include: {
        doador: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    // Agrupar por doador e somar quantidades
    const doadoresMap = new Map();
    
    doacoes.forEach(doacao => {
      const doadorId = doacao.doadorId;
      const doadorNome = doacao.doador.nome;
      
      if (doadoresMap.has(doadorId)) {
        doadoresMap.get(doadorId).total += doacao.quantidade;
      } else {
        doadoresMap.set(doadorId, {
          id: doadorId,
          nome: doadorNome,
          total: doacao.quantidade
        });
      }
    });

    // Converter para array e ordenar
    const rankingFormatado = Array.from(doadoresMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((item, index) => ({
        ...item,
        posicao: index + 1
      }));

    return res.status(200).json(rankingFormatado);
  } catch (error) {
    console.error('Erro ao buscar ranking de doadores:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 
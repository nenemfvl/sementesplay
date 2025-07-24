import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const parceiros = await prisma.parceiro.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            nivel: true
          }
        }
      },
      orderBy: {
        nomeCidade: 'asc'
      }
    });
    res.status(200).json({ parceiros });
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 
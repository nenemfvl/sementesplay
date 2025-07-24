import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUserFromToken } from '../utils/auth-backend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    const usuario = await prisma.usuario.findUnique({
      where: { id: user.id },
      include: {
        criador: true,
        parceiro: true
      }
    });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const { senha, ...usuarioSemSenha } = usuario;
    return res.status(200).json(usuarioSemSenha);
  }
  if (req.method === 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
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

    // Usar as sementes do usuário, mas se for criador, considerar também as sementes do criador
    let usuarioComSementes: any = { ...usuario };
    
    // Se o usuário for um criador, calcular sementes recebidas
    if (usuario.criador) {
      // Buscar doações recebidas para calcular sementes totais
      const doacoes = await prisma.doacao.findMany({
        where: { criadorId: usuario.criador.id },
        select: { quantidade: true }
      });
      
      const totalSementesRecebidas = doacoes.reduce((sum, doacao) => sum + doacao.quantidade, 0);
      usuarioComSementes.sementesRecebidas = totalSementesRecebidas;
      // Manter as sementes disponíveis do usuário
      usuarioComSementes.sementes = usuario.sementes;
    }

    const { senha, ...usuarioSemSenha } = usuarioComSementes;
    return res.status(200).json(usuarioSemSenha);
  }
  if (req.method === 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
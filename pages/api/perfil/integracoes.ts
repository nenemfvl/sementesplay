import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../lib/auth';

let integracoes: any = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação
  const user = auth.getUser();
  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  // Verificar se é criador
  if (user.nivel !== 'criador') {
    return res.status(403).json({ error: 'Acesso negado. Apenas criadores podem acessar esta funcionalidade.' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(integracoes);
  }
  if (req.method === 'POST') {
    integracoes = { ...integracoes, ...req.body };
    return res.status(200).json(integracoes);
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
import { NextApiRequest, NextApiResponse } from 'next';

let perfil: any = { id: 'mockid', nome: 'Criador Exemplo' };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(perfil);
  }
  if (req.method === 'POST') {
    perfil = { ...perfil, ...req.body };
    return res.status(200).json(perfil);
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
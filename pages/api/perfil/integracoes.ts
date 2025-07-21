import { NextApiRequest, NextApiResponse } from 'next';

let integracoes: any = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(integracoes);
  }
  if (req.method === 'POST') {
    integracoes = { ...integracoes, ...req.body };
    return res.status(200).json(integracoes);
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
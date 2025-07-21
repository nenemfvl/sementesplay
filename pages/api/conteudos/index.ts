import { NextApiRequest, NextApiResponse } from 'next';

let conteudos: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(conteudos);
  }
  if (req.method === 'POST') {
    const novo = { id: Date.now().toString(), ...req.body, dataPublicacao: new Date().toISOString() };
    conteudos.push(novo);
    return res.status(201).json(novo);
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
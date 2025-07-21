import { NextApiRequest, NextApiResponse } from 'next';

let missoes: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(missoes);
  }
  if (req.method === 'POST') {
    const nova = { id: Date.now().toString(), ...req.body, data: new Date().toISOString() };
    missoes.push(nova);
    return res.status(201).json(nova);
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
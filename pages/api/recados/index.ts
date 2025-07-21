import { NextApiRequest, NextApiResponse } from 'next';

let recados: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(recados);
  }
  if (req.method === 'POST') {
    const novo = { id: Date.now().toString(), ...req.body, data: new Date().toISOString() };
    recados.push(novo);
    return res.status(201).json(novo);
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
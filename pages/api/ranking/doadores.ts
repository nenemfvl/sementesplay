import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json([]);
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
import { NextApiRequest, NextApiResponse } from 'next';

let recados: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id, resposta } = req.body;
    const recado = recados.find(r => r.id === id);
    if (recado) recado.resposta = resposta;
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
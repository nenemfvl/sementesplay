import { NextApiRequest, NextApiResponse } from 'next';

let enquetes: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(enquetes);
  }
  if (req.method === 'POST') {
    const { pergunta, opcoes } = req.body;
    const nova = {
      id: Date.now().toString(),
      pergunta,
      opcoes: opcoes.map((texto: string, i: number) => ({ id: i.toString(), texto, votos: 0 })),
      data: new Date().toISOString()
    };
    enquetes.push(nova);
    return res.status(201).json(nova);
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Retornar dados da sessão atual
    const user = {
      id: '1',
      nome: 'Usuário Teste',
      email: 'teste@sementesplay.com',
      tipo: 'doador',
      sementes: 1000,
      nivel: '5',
      pontuacao: 500,
      dataCriacao: new Date().toISOString()
    }

    res.status(200).json({
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    })
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 
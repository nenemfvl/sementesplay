import { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromToken } from '../utils/auth-backend'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const user = getUserFromToken(req)
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
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
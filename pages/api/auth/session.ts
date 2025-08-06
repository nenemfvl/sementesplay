import { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromToken } from '../utils/auth-backend'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = getUserFromToken(req)
      if (!user) {
        // Se não há token válido, retornar 200 com usuário null (não 401)
        return res.status(200).json({
          user: null,
          expires: null
        })
      }
      res.status(200).json({
        user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      })
    } catch (error) {
      // Em caso de erro, retornar 200 com usuário null
      res.status(200).json({
        user: null,
        expires: null
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 
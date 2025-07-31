import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ 
    message: 'API raiz funcionando!',
    method: req.method,
    timestamp: new Date().toISOString()
  })
} 
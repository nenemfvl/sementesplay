import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API simple-test chamada:', req.method, req.url)
  
  return res.status(200).json({ 
    success: true,
    message: 'API simple-test funcionando!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  })
} 
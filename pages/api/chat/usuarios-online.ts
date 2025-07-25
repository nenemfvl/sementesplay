import { NextApiRequest, NextApiResponse } from 'next'

// Armazena os usuários online em memória (para produção, use Redis ou DB)
let usuariosOnline: Record<string, number> = {}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API usuarios-online chamada:', req.method)
  if (req.method === 'POST') {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId obrigatório' })
    usuariosOnline[userId] = Date.now()
    return res.status(200).json({ ok: true })
  }
  if (req.method === 'GET') {
    const agora = Date.now()
    const online = Object.keys(usuariosOnline).filter(
      id => agora - usuariosOnline[id] < 30000 // 30 segundos
    )
    return res.status(200).json({ online })
  }
  res.setHeader('Allow', ['POST', 'GET'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
} 
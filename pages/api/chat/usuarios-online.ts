import { NextApiRequest, NextApiResponse } from 'next'

// Simulação de usuários online em memória
let onlineUsers: { [id: string]: number } = {}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Recebe um ping do usuário para marcar como online
    const { userId } = req.body
    if (userId) {
      onlineUsers[userId] = Date.now()
    }
    // Limpa usuários que não deram ping nos últimos 20 segundos
    const now = Date.now()
    Object.keys(onlineUsers).forEach(id => {
      if (now - onlineUsers[id] > 20000) {
        delete onlineUsers[id]
      }
    })
    return res.status(200).json({ success: true })
  }
  if (req.method === 'GET') {
    // Retorna lista de IDs online
    return res.status(200).json({ online: Object.keys(onlineUsers) })
  }
  return res.status(405).json({ error: 'Método não permitido' })
} 
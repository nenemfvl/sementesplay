import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'

const connectionString = process.env.DATABASE_URL || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = new Client({ connectionString })
  await client.connect()

  if (req.method === 'POST') {
    const { userId } = req.body
    if (userId) {
      await client.query(
        `INSERT INTO usuarios_online (usuario_id, atualizado_em)
         VALUES ($1, NOW())
         ON CONFLICT (usuario_id) DO UPDATE SET atualizado_em = NOW()`,
        [userId]
      )
    }
    await client.end()
    return res.status(200).json({ success: true })
  }

  if (req.method === 'GET') {
    // Retorna usuários que deram ping hoje (com date)
    const { rows } = await client.query(
      `SELECT usuario_id FROM usuarios_online WHERE atualizado_em = CURRENT_DATE`
    )
    await client.end()
    return res.status(200).json({ online: rows.map(r => r.usuario_id) })
  }

  await client.end()
  return res.status(405).json({ error: 'Método não permitido' })
} 
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query
    const { nivel } = req.body

    if (!id || !nivel) {
      return res.status(400).json({ error: 'ID do usuário e nível são obrigatórios' })
    }

    // Validar nível
    const niveisValidos = ['comum', 'parceiro', 'supremo']
    if (!niveisValidos.includes(nivel)) {
      return res.status(400).json({ error: 'Nível inválido' })
    }

    // Atualizar usuário
    const usuario = await prisma.usuario.update({
      where: { id: String(id) },
      data: { nivel: String(nivel) }
    })

    return res.status(200).json({ 
      message: 'Nível alterado com sucesso',
      usuario
    })
  } catch (error) {
    console.error('Erro ao alterar nível:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
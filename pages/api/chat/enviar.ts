import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { remetenteId, conteudo } = req.body

    if (!remetenteId || !conteudo) {
      return res.status(400).json({ error: 'Remetente e conteúdo são obrigatórios' })
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: String(remetenteId) }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Por enquanto, apenas simular o envio
    // Em uma implementação real, você salvaria na tabela mensagens_chat
    const mensagem = {
      id: Date.now().toString(),
      remetenteId: String(remetenteId),
      remetenteNome: usuario.nome,
      conteudo: String(conteudo),
      timestamp: new Date(),
      tipo: 'texto'
    }

    return res.status(200).json({ 
      message: 'Mensagem enviada com sucesso',
      mensagem
    })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
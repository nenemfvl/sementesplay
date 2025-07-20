import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Por enquanto, retornar dados mockados
      const mensagens = [
        {
          id: '1',
          remetenteId: '1',
          remetenteNome: 'João Silva',
          conteudo: 'Oi! Como você está?',
          timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 min atrás
          tipo: 'texto',
          lida: true
        },
        {
          id: '2',
          remetenteId: 'user', // ID do usuário atual
          remetenteNome: 'Você',
          conteudo: 'Oi João! Tudo bem, e você?',
          timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 min atrás
          tipo: 'texto',
          lida: true
        },
        {
          id: '3',
          remetenteId: '1',
          remetenteNome: 'João Silva',
          conteudo: 'Tudo ótimo! Viu o novo ranking?',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min atrás
          tipo: 'texto',
          lida: false
        },
        {
          id: '4',
          remetenteId: '1',
          remetenteNome: 'João Silva',
          conteudo: 'Você está em primeiro lugar! 🎉',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min atrás
          tipo: 'texto',
          lida: false
        }
      ]

      return res.status(200).json({ mensagens })
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { conteudo, tipo } = req.body

      if (!conteudo || !tipo) {
        return res.status(400).json({ error: 'Conteúdo e tipo são obrigatórios' })
      }

      // Em produção, você salvaria a mensagem no banco
      const novaMensagem = {
        id: Date.now().toString(),
        remetenteId: 'user', // ID do usuário atual
        remetenteNome: 'Você',
        conteudo,
        timestamp: new Date(),
        tipo,
        lida: false
      }

      return res.status(201).json({ mensagem: novaMensagem })
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 
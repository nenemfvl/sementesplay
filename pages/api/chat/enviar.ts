import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { conversaId, remetenteId, texto } = req.body

    if (!conversaId || !remetenteId || !texto) {
      return res.status(400).json({ error: 'ConversaId, remetenteId e texto são obrigatórios' })
    }

    // Verificar se a conversa existe
    const conversa = await prisma.conversa.findUnique({
      where: { id: String(conversaId) }
    })

    if (!conversa) {
      return res.status(404).json({ error: 'Conversa não encontrada' })
    }

    // Criar nova mensagem
    const novaMensagem = await prisma.mensagem.create({
      data: {
        conversaId: String(conversaId),
        remetenteId: String(remetenteId),
        texto: String(texto)
      },
      include: {
        remetente: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    // Atualizar última mensagem da conversa
    await prisma.conversa.update({
      where: { id: String(conversaId) },
      data: {
        ultimaMensagem: novaMensagem.dataEnvio
      }
    })

    const mensagemFormatada = {
      id: novaMensagem.id,
      remetenteId: novaMensagem.remetenteId,
      remetenteNome: novaMensagem.remetente.nome,
      conteudo: novaMensagem.texto,
      timestamp: novaMensagem.dataEnvio,
      tipo: 'texto',
      lida: novaMensagem.lida
    }

    return res.status(201).json({ mensagem: mensagemFormatada })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query

      if (!usuarioId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' })
      }

      // Buscar recados recebidos pelo usuário
      const recados = await prisma.recado.findMany({
        where: { destinatarioId: String(usuarioId) },
        include: {
          remetente: true
        },
        orderBy: { dataEnvio: 'desc' }
      })

      // Formatar recados
      const recadosFormatados = recados.map(recado => ({
        id: recado.id,
        remetente: recado.remetente.nome,
        titulo: recado.titulo,
        mensagem: recado.mensagem,
        lido: recado.lido,
        dataEnvio: recado.dataEnvio,
        dataLeitura: recado.dataLeitura
      }))

      return res.status(200).json(recadosFormatados)
    } catch (error) {
      console.error('Erro ao buscar recados:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { remetenteId, destinatarioId, titulo, mensagem } = req.body

      if (!remetenteId || !destinatarioId || !titulo || !mensagem) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      // Criar novo recado
      const novoRecado = await prisma.recado.create({
        data: {
          remetenteId: String(remetenteId),
          destinatarioId: String(destinatarioId),
          titulo: String(titulo),
          mensagem: String(mensagem),
          lido: false
        }
      })

      return res.status(201).json(novoRecado)
    } catch (error) {
      console.error('Erro ao criar recado:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 
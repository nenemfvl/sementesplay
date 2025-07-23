import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query

      // Buscar enquetes ativas
      const enquetes = await prisma.Enquete.findMany({
        where: { ativa: true },
        include: {
          criador: true,
          votos: {
            where: { usuarioId: usuarioId ? String(usuarioId) : undefined }
          }
        },
        orderBy: { dataCriacao: 'desc' }
      })

      // Formatar enquetes com opções e votos
      const enquetesFormatadas = enquetes.map((enquete: any) => {
        const opcoes = JSON.parse(enquete.opcoes || '[]')
        const votosUsuario = enquete.votos[0]

        return {
          id: enquete.id,
          pergunta: enquete.pergunta,
          opcoes: opcoes.map((opcao: string, index: number) => ({
            id: index.toString(),
            texto: opcao,
            votos: 0 // Será calculado separadamente
          })),
          data: enquete.dataCriacao,
          criador: enquete.criador.nome,
          votoUsuario: votosUsuario ? votosUsuario.opcaoIndex : null
        }
      })

      return res.status(200).json(enquetesFormatadas)
    } catch (error) {
      console.error('Erro ao buscar enquetes:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { criadorId, pergunta, opcoes } = req.body

      if (!criadorId || !pergunta || !opcoes || !Array.isArray(opcoes)) {
        return res.status(400).json({ error: 'Dados inválidos' })
      }

      // Criar nova enquete
      const novaEnquete = await prisma.Enquete.create({
        data: {
          criadorId: String(criadorId),
          pergunta: String(pergunta),
          opcoes: JSON.stringify(opcoes),
          ativa: true
        }
      })

      return res.status(201).json(novaEnquete)
    } catch (error) {
      console.error('Erro ao criar enquete:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 
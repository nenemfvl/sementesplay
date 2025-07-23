import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar enquetes ativas
      const enquetes = await prisma.enquetes.findMany({
        where: {
          ativa: true,
          OR: [
            { dataFim: null },
            { dataFim: { gt: new Date() } }
          ]
        },
        include: {
          criador: {
            select: {
              id: true,
              nome: true
            }
          },
          votos: {
            select: {
              opcaoIndex: true
            }
          }
        },
        orderBy: {
          dataCriacao: 'desc'
        }
      })

      const enquetesFormatadas = enquetes.map(enquete => {
        const opcoes = JSON.parse(enquete.opcoes)
        const totalVotos = enquete.votos.length
        
        // Calcular votos por opção
        const votosPorOpcao = opcoes.map((opcao: string, index: number) => {
          const votos = enquete.votos.filter(voto => voto.opcaoIndex === index).length
          return {
            opcao,
            votos,
            porcentagem: totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0
          }
        })

        return {
          id: enquete.id,
          pergunta: enquete.pergunta,
          opcoes: votosPorOpcao,
          criador: enquete.criador.nome,
          totalVotos,
          dataCriacao: enquete.dataCriacao,
          dataFim: enquete.dataFim,
          ativa: enquete.ativa
        }
      })

      return res.status(200).json({ enquetes: enquetesFormatadas })
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

      const novaEnquete = await prisma.enquetes.create({
        data: {
          criadorId: String(criadorId),
          pergunta: String(pergunta),
          opcoes: JSON.stringify(opcoes),
          ativa: true
        }
      })

      return res.status(201).json({ enquete: novaEnquete })
    } catch (error) {
      console.error('Erro ao criar enquete:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 
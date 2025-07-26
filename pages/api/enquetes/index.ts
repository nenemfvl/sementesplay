import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação via token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }

  const token = authHeader.replace('Bearer ', '')
  
  // Buscar usuário pelo token (ID do usuário)
  const user = await prisma.usuario.findUnique({
    where: { id: token }
  });

  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  if (req.method === 'GET') {
    try {
      const { criadorId } = req.query
      
      // Construir filtros
      const where: any = {
        ativa: true,
        OR: [
          { dataFim: null },
          { dataFim: { gt: new Date() } }
        ]
      }
      
      if (criadorId) {
        where.criadorId = String(criadorId)
      }
      
      // Buscar enquetes ativas
      const enquetes = await prisma.enquete.findMany({
        where,
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

      const enquetesFormatadas = enquetes.map((enquete: any) => {
        const opcoes = JSON.parse(enquete.opcoes)
        const totalVotos = enquete.votos.length
        
        // Calcular votos por opção
        const votosPorOpcao = opcoes.map((opcao: string, index: number) => {
          const votos = enquete.votos.filter((voto: any) => voto.opcaoIndex === index).length
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
      // Verificar se é criador para criar enquetes
      if (user.nivel !== 'criador') {
        return res.status(403).json({ error: 'Acesso negado. Apenas criadores podem criar enquetes.' });
      }

      const { pergunta, opcoes } = req.body

      if (!pergunta || !opcoes || !Array.isArray(opcoes)) {
        return res.status(400).json({ error: 'Dados inválidos' })
      }

      // Buscar o criador do usuário
      const criador = await prisma.criador.findUnique({
        where: { usuarioId: user.id }
      });

      if (!criador) {
        return res.status(403).json({ error: 'Criador não encontrado' });
      }

      const novaEnquete = await prisma.enquete.create({
        data: {
          criadorId: criador.id,
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
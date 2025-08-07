import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { auth } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      // Buscar conversas do usuário
      const conversas = await prisma.conversaSuporte.findMany({
        where: {
          usuarioId: user.id
        },
        include: {
          mensagens: {
            orderBy: {
              dataEnvio: 'asc'
            }
          }
        },
        orderBy: {
          dataAtualizacao: 'desc'
        }
      })

      return res.status(200).json({ conversas })
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const { titulo, categoria, mensagem } = req.body

      if (!mensagem) {
        return res.status(400).json({ error: 'Mensagem é obrigatória' })
      }

      // Criar nova conversa
      const conversa = await prisma.conversaSuporte.create({
        data: {
          usuarioId: user.id,
          titulo: titulo || `Suporte - ${new Date().toLocaleDateString('pt-BR')}`,
          categoria: categoria || 'outros'
        }
      })

      // Criar primeira mensagem
      const primeiraMensagem = await prisma.mensagemSuporte.create({
        data: {
          conversaId: conversa.id,
          remetenteId: user.id,
          mensagem,
          tipo: 'usuario'
        }
      })

      return res.status(201).json({ 
        conversa,
        mensagem: primeiraMensagem
      })
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}

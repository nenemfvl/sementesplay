import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar todas as missões (ativas e inativas)
      const missoes = await prisma.missao.findMany({
        orderBy: {
          dataInicio: 'desc'
        }
      })

      const missoesFormatadas = missoes.map(missao => ({
        id: missao.id,
        titulo: missao.titulo,
        descricao: missao.descricao,
        objetivo: missao.objetivo,
        recompensa: missao.recompensa,
        tipo: missao.tipo,
        ativa: missao.ativa,
        dataCriacao: missao.dataInicio,
        emblema: missao.emblema
      }))

      return res.status(200).json({ missoes: missoesFormatadas })
    } catch (error) {
      console.error('Erro ao buscar missões:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { titulo, descricao, objetivo, recompensa, tipo, ativa, emblema } = req.body

      if (!titulo || !descricao || !objetivo || !recompensa || !tipo) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
      }

      // Criar nova missão
      const novaMissao = await prisma.missao.create({
        data: {
          titulo,
          descricao,
          objetivo,
          recompensa: parseInt(recompensa),
          tipo,
          ativa: ativa || false,
          emblema: emblema || null,
          dataInicio: new Date()
        }
      })

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: 'system',
          acao: 'CRIAR_MISSAO',
          detalhes: `Missão criada. ID: ${novaMissao.id}, Título: ${titulo}, Tipo: ${tipo}, Recompensa: ${recompensa} sementes, Ativa: ${ativa || false}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
        }
      })

      return res.status(201).json({ 
        message: 'Missão criada com sucesso',
        missao: novaMissao 
      })
    } catch (error) {
      console.error('Erro ao criar missão:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query

      // Buscar missões ativas
      const missoes = await prisma.missao.findMany({
        where: { ativa: true },
        include: {
          usuarios: {
            where: { usuarioId: usuarioId ? String(usuarioId) : undefined },
            include: { usuario: true }
          }
        },
        orderBy: { dataInicio: 'desc' }
      })

      // Formatar missões com progresso do usuário
      const missoesFormatadas = missoes.map(missao => {
        const progressoUsuario = missao.usuarios[0]
        
        return {
          id: missao.id,
          titulo: missao.titulo,
          descricao: missao.descricao,
          tipo: missao.tipo,
          recompensa: missao.recompensa,
          ativa: missao.ativa,
          dataInicio: missao.dataInicio,
          dataFim: missao.dataFim,
          criadorOnly: missao.criadorOnly,
          progresso: progressoUsuario?.progresso || 0,
          concluida: progressoUsuario?.concluida || false,
          dataInicioUsuario: progressoUsuario?.dataInicio,
          dataConclusao: progressoUsuario?.dataConclusao
        }
      })

      return res.status(200).json(missoesFormatadas)
    } catch (error) {
      console.error('Erro ao buscar missões:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { titulo, descricao, tipo, recompensa, criadorOnly, dataFim } = req.body

      // Validações básicas
      if (!titulo || !descricao || !tipo || !recompensa) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
      }

      // Criar nova missão
      const novaMissao = await prisma.missao.create({
        data: {
          titulo: String(titulo),
          descricao: String(descricao),
          tipo: String(tipo),
          recompensa: parseInt(recompensa),
          criadorOnly: Boolean(criadorOnly),
          dataFim: dataFim ? new Date(dataFim) : null,
          ativa: true
        }
      })

      return res.status(201).json(novaMissao)
    } catch (error) {
      console.error('Erro ao criar missão:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Verificar autenticação via token Bearer
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação necessário' })
      }

      const token = authHeader.substring(7)
      
      // Decodificar o token (simples para este exemplo)
      let user
      try {
        user = JSON.parse(Buffer.from(token, 'base64').toString())
      } catch (error) {
        return res.status(401).json({ error: 'Token inválido' })
      }

      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      // Verificar se é admin
      if (Number(user.nivel) < 5) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      // Buscar todas as candidaturas
      const candidaturas = await prisma.candidaturaCriador.findMany({
        include: {
          usuario: {
            select: {
              nome: true,
              email: true,
              nivel: true
            }
          }
        },
        orderBy: {
          dataCandidatura: 'desc'
        }
      })

      // Formatar dados para resposta
      const candidaturasFormatadas = candidaturas.map(candidatura => ({
        id: candidatura.id,
        usuarioId: candidatura.usuarioId,
        nome: candidatura.nome,
        email: candidatura.email,
        bio: candidatura.bio,
        categoria: candidatura.categoria,
        redesSociais: JSON.parse(candidatura.redesSociais || '{}'),
        portfolio: JSON.parse(candidatura.portfolio || '{}'),
        experiencia: candidatura.experiencia,
        motivacao: candidatura.motivacao,
        metas: candidatura.metas,
        disponibilidade: candidatura.disponibilidade,
        status: candidatura.status,
        dataCandidatura: candidatura.dataCandidatura,
        dataRevisao: candidatura.dataRevisao,
        observacoes: candidatura.observacoes
      }))

      res.status(200).json({ candidaturas: candidaturasFormatadas })

    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 
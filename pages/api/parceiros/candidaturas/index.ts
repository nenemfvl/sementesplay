import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        nome,
        email,
        telefone,
        nomeCidade,
        siteCidade,
        descricao,
        experiencia,
        expectativa
      } = req.body

      // Validar campos obrigatórios
      if (!nome || !email || !telefone || !nomeCidade || !descricao || !experiencia || !expectativa) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      // Verificar se já existe candidatura para este email
      const candidaturaExistente = await prisma.candidaturaParceiro.findFirst({
        where: { email }
      })

      if (candidaturaExistente) {
        return res.status(400).json({ error: 'Já existe uma candidatura para este email' })
      }

      // Criar candidatura
      const candidatura = await prisma.candidaturaParceiro.create({
        data: {
          nome,
          email,
          telefone,
          nomeCidade,
          siteCidade: siteCidade || '',
          descricao,
          experiencia,
          expectativa,
          status: 'pendente',
          dataCandidatura: new Date()
        }
      })

      res.status(201).json({ 
        success: true, 
        message: 'Candidatura enviada com sucesso!',
        candidatura 
      })

    } catch (error) {
      console.error('Erro ao criar candidatura:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'GET') {
    try {
      const { email } = req.query

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email é obrigatório' })
      }

      const candidatura = await prisma.candidaturaParceiro.findFirst({
        where: { email }
      })

      res.status(200).json({ candidatura })

    } catch (error) {
      console.error('Erro ao buscar candidatura:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET'])
    res.status(405).json({ error: `Método ${req.method} não permitido` })
  }
} 
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }
  try {
    const { id } = req.query
    const { observacoes } = req.body
    // Buscar candidatura
    const candidatura = await prisma.candidaturaParceiro.findUnique({
      where: { id: String(id) }
    })
    if (!candidatura) {
      return res.status(404).json({ error: 'Candidatura não encontrada' })
    }
    if (candidatura.status !== 'pendente') {
      return res.status(400).json({ error: 'Candidatura já foi processada' })
    }
    // Aprovar candidatura
    await prisma.candidaturaParceiro.update({
      where: { id: String(id) },
      data: {
        status: 'aprovada',
        dataRevisao: new Date(),
        observacoes: observacoes || 'Candidatura aprovada.'
      }
    })
    // Buscar usuário pelo email da candidatura
    const usuario = await prisma.usuario.findFirst({ where: { email: candidatura.email } })
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado para o email da candidatura' })
    }
    // Criar registro de parceiro
    await prisma.parceiro.create({
      data: {
        usuarioId: usuario.id,
        nomeCidade: candidatura.nomeCidade,
        comissaoMensal: 500.00,
        totalVendas: 0,
        codigosGerados: 0
      }
    })
    // Atualizar nivel do usuário
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { nivel: 'parceiro' }
    })
    res.status(200).json({ message: 'Candidatura de parceiro aprovada com sucesso', candidaturaId: id })
  } catch (error) {
    console.error('Erro ao aprovar candidatura de parceiro:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
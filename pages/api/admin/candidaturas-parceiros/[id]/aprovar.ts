import { prisma } from '../../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.query

      const user = await prisma.usuario.findFirst({
        where: { nivel: '5' }
      })

      if (!user) {
        return res.status(403).json({ error: 'Acesso negado - Admin não encontrado' })
      }

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID da candidatura é obrigatório' })
      }

      const candidatura = await prisma.candidaturaParceiro.findUnique({
        where: { id },
        include: { usuario: true }
      })

      if (!candidatura) {
        return res.status(404).json({ error: 'Candidatura não encontrada' })
      }

      if (candidatura.status !== 'pendente') {
        return res.status(400).json({ error: 'Candidatura já foi processada' })
      }

      await prisma.$transaction(async (prisma) => {
        // Atualizar status da candidatura
        await prisma.candidaturaParceiro.update({
          where: { id },
          data: {
            status: 'aprovada'
          }
        })

        // Criar parceiro
        await prisma.parceiro.create({
          data: {
            usuarioId: candidatura.usuarioId,
            nomeCidade: candidatura.nomeCidade,
            comissaoMensal: 500, // Valor padrão
            totalVendas: 0,
            codigosGerados: 0
          }
        })

        // Atualizar nível do usuário para parceiro
        await prisma.usuario.update({
          where: { id: candidatura.usuarioId },
          data: {
            nivel: 'parceiro' // Nível de parceiro
          }
        })

        // Criar notificação
        await prisma.notificacao.create({
          data: {
            usuarioId: candidatura.usuarioId,
            titulo: 'Candidatura Aprovada!',
            mensagem: `Parabéns! Sua candidatura para se tornar parceiro foi aprovada. Você agora tem acesso ao painel de parceiros.`,
            tipo: 'sucesso',
            lida: false
          }
        })
      })

      res.status(200).json({ message: 'Candidatura aprovada com sucesso' })

    } catch (error) {
      console.error('Erro ao aprovar candidatura:', error)
      res.status(500).json({ error: 'Erro interno do servidor ao aprovar candidatura' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId, codigo } = req.body

    // Validações básicas
    if (!usuarioId || !codigo) {
      return res.status(400).json({ error: 'Usuário e código são obrigatórios' })
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Buscar código de cashback
    const codigoCashback = await prisma.codigoCashback.findUnique({
      where: { codigo },
      include: { parceiro: { include: { usuario: true } } }
    })

    if (!codigoCashback) {
      return res.status(404).json({ error: 'Código de cashback inválido' })
    }

    if (codigoCashback.usado) {
      return res.status(400).json({ error: 'Código de cashback já foi utilizado' })
    }

    // Verificar se o código não expirou (30 dias)
    const dataExpiracao = new Date(codigoCashback.dataGeracao)
    dataExpiracao.setDate(dataExpiracao.getDate() + 30)

    if (new Date() > dataExpiracao) {
      return res.status(400).json({ error: 'Código de cashback expirado' })
    }

    // Resgatar cashback
    const resultado = await prisma.$transaction(async (tx) => {
      // Marcar código como usado
      await tx.codigoCashback.update({
        where: { id: codigoCashback.id },
        data: {
          usado: true,
          dataUso: new Date()
        }
      })

      // Adicionar sementes ao usuário
      await tx.usuario.update({
        where: { id: usuarioId },
        data: { sementes: { increment: codigoCashback.valor } }
      })

      // Registrar histórico de sementes
      await tx.semente.create({
        data: {
          usuarioId,
          quantidade: codigoCashback.valor,
          tipo: 'resgatada',
          descricao: `Cashback resgatado - Código: ${codigo}`
        }
      })

      // Criar notificação
      await tx.notificacao.create({
        data: {
          usuarioId,
          tipo: 'cashback',
          titulo: 'Cashback resgatado!',
          mensagem: `Você recebeu ${codigoCashback.valor} Sementes do código ${codigo}`
        }
      })

      return {
        valor: codigoCashback.valor,
        parceiro: codigoCashback.parceiro.usuario.nome
      }
    })

    res.status(200).json({
      message: 'Cashback resgatado com sucesso',
      resultado
    })

  } catch (error) {
    console.error('Erro ao resgatar cashback:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
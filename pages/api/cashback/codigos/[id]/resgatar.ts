import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query
    const { usuarioId } = req.body

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar o código de cashback
    const codigo = await prisma.codigoCashback.findUnique({
      where: { id: String(id) },
      include: {
        parceiro: {
          select: {
            nomeCidade: true
          }
        }
      }
    })

    if (!codigo) {
      return res.status(404).json({ error: 'Código não encontrado' })
    }

    if (codigo.usado) {
      return res.status(400).json({ error: 'Código já foi usado' })
    }

    // Verificar se o código não expirou
    if (codigo.dataExpiracao && new Date() > codigo.dataExpiracao) {
      return res.status(400).json({ error: 'Código expirado' })
    }

    // Transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Marcar código como usado
      await tx.codigoCashback.update({
        where: { id: String(id) },
        data: {
          usado: true,
          usuarioId: String(usuarioId),
          dataUso: new Date()
        }
      })

      // Creditar sementes para o usuário
      await tx.usuario.update({
        where: { id: String(usuarioId) },
        data: {
          sementes: {
            increment: codigo.valor
          }
        }
      })

      // Registrar no histórico de sementes
      await tx.semente.create({
        data: {
          usuarioId: String(usuarioId),
          quantidade: codigo.valor,
          tipo: 'resgatada',
          descricao: `Código de cashback ${codigo.codigo} - ${codigo.parceiro.nomeCidade}`
        }
      })
    })

    return res.status(200).json({
      success: true,
      message: 'Código resgatado com sucesso!',
      valor: codigo.valor
    })
  } catch (error) {
    console.error('Erro ao resgatar código:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
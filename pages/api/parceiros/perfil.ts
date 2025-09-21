import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar o usuário logado (simulado - em produção seria via token/session)
    const { usuarioId, parceiroId } = req.query

    if (!usuarioId && !parceiroId) {
      return res.status(400).json({ error: 'ID do usuário ou do parceiro é obrigatório' })
    }

    let parceiro
    if (parceiroId) {
      // Se foi passado o ID do parceiro, buscar por ele
      parceiro = await prisma.parceiro.findUnique({
        where: {
          id: String(parceiroId)
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              nivel: true,
              avatarUrl: true
            }
          }
        }
      })
    } else {
      // Se foi passado o ID do usuário, buscar por ele
      parceiro = await prisma.parceiro.findUnique({
        where: {
          usuarioId: String(usuarioId)
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              nivel: true,
              avatarUrl: true
            }
          }
        }
      })
    }

    if (!parceiro) {
      return res.status(404).json({ error: 'Parceiro não encontrado' })
    }

    // Buscar códigos do parceiro
    const codigosParceiro = await prisma.codigoCashback.findMany({
      where: {
        parceiroId: parceiro.id
      },
      select: {
        codigo: true,
        usado: true
      }
    })

    const codigos = codigosParceiro.map(c => c.codigo)

    // Buscar repasses realizados pelo parceiro
    const repassesRealizados = await prisma.repasseParceiro.findMany({
      where: {
        parceiroId: parceiro.id,
        status: 'pago'
      }
    })

    // Calcular total de vendas real (baseado nos repasses realizados)
    const totalVendasReal = repassesRealizados.reduce((sum, r) => sum + r.valor, 0)
    
    // Calcular códigos gerados (todos os códigos criados pelo parceiro)
    const codigosGerados = codigosParceiro.length

    // Retornar dados do parceiro com valores calculados
    const parceiroComEstatisticas = {
      ...parceiro,
      totalVendas: totalVendasReal,
      codigosGerados: codigosGerados
    }

    res.status(200).json(parceiroComEstatisticas)
  } catch (error) {
    console.error('Erro ao buscar perfil do parceiro:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
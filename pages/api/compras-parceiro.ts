import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId, parceiroId, valorCompra, comprovanteUrl, dataCompra } = req.body

    if (!usuarioId || !parceiroId || !valorCompra || !dataCompra) {
      return res.status(400).json({ error: 'Campos obrigatórios não informados' })
    }

    // Verifica se o parceiro existe
    const parceiro = await prisma.parceiro.findUnique({ where: { id: parceiroId } })
    if (!parceiro) {
      return res.status(404).json({ error: 'Parceiro não encontrado' })
    }

    // Cria registro da compra
    const compra = await prisma.compraParceiro.create({
      data: {
        usuarioId,
        parceiroId,
        valorCompra: parseFloat(valorCompra),
        comprovanteUrl: comprovanteUrl || null,
        dataCompra: new Date(dataCompra),
        status: 'aguardando_repasse',
        cupomUsado: 'sementesplay10', // Alterado de sementesplay20 para sementesplay10
      }
    })

    // Calcula o valor do repasse (10% da compra)
    const valorRepasse = parseFloat(valorCompra) * 0.10

    // Cria automaticamente o repasse pendente
    const repasse = await prisma.repasseParceiro.create({
      data: {
        parceiroId,
        compraId: compra.id,
        valor: valorRepasse,
        status: 'pendente',
        usuarioId: usuarioId, // Adiciona o ID do usuário que fez a compra
      }
    })

    // Atualiza o status da compra
    await prisma.compraParceiro.update({
      where: { id: compra.id },
      data: { status: 'repasse_pendente' }
    })

    return res.status(201).json({ message: 'Compra registrada com sucesso', compra, repasse })
  } catch (error) {
    console.error('Erro ao registrar compra:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
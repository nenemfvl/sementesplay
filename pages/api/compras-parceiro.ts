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

    // Verifica se o usuário existe
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Cria solicitação de compra pendente
    const solicitacaoCompra = await prisma.solicitacaoCompra.create({
      data: {
        usuarioId,
        parceiroId,
        valorCompra: parseFloat(valorCompra),
        comprovanteUrl: comprovanteUrl || null,
        dataCompra: new Date(dataCompra),
        status: 'pendente',
        cupomUsado: 'sementesplay10',
      }
    })

    // Cria notificação para o parceiro
    await prisma.notificacao.create({
      data: {
        usuarioId: parceiro.usuarioId,
        titulo: 'Nova Solicitação de Compra',
        mensagem: `Nova solicitação de compra de R$ ${parseFloat(valorCompra).toFixed(2)} aguardando sua aprovação.`,
        tipo: 'solicitacao_compra',
        dados: JSON.stringify({ solicitacaoId: solicitacaoCompra.id })
      }
    })

    return res.status(201).json({ 
      success: true, 
      message: 'Solicitação de compra enviada com sucesso! Aguarde a aprovação do parceiro.',
      solicitacao: solicitacaoCompra
    })

  } catch (error) {
    console.error('Erro ao criar solicitação de compra:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
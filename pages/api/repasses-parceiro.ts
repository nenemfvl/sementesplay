import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { parceiroId, compraId, valor, comprovanteUrl, comprovanteType, comprovanteSize } = req.body

    if (!parceiroId || !compraId || !valor) {
      return res.status(400).json({ error: 'Campos obrigatórios não informados' })
    }

    // Validação de comprovante (simples, pois é url local; idealmente validar upload real)
    if (comprovanteType && !['image/jpeg','image/png','image/gif','application/pdf'].includes(comprovanteType)) {
      return res.status(400).json({ error: 'Tipo de arquivo não permitido. Envie imagem ou PDF.' })
    }
    if (comprovanteSize && comprovanteSize > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo permitido: 5MB.' })
    }

    // Verifica se a compra existe
    const compra = await prisma.compraParceiro.findUnique({ where: { id: compraId } })
    if (!compra) {
      return res.status(404).json({ error: 'Compra não encontrada' })
    }

    // Validação: valor deve ser 10% da compra (era 20%)
    const valorEsperado = compra.valorCompra * 0.10
    if (Math.abs(valor - valorEsperado) > 0.01) {
      return res.status(400).json({ 
        error: `Valor deve ser 10% da compra (R$ ${valorEsperado.toFixed(2)})`,
        valorEsperado: valorEsperado,
        valorRecebido: valor
      })
    }

    // Cria registro do repasse
    const repasse = await prisma.repasseParceiro.create({
                data: {
        parceiroId,
        compraId,
        valor: parseFloat(valor),
        comprovanteUrl: comprovanteUrl || null,
        status: 'pendente',
      }
    })

    // Atualiza status da compra para aguardando confirmação do repasse
    await prisma.compraParceiro.update({
      where: { id: compraId },
      data: { status: 'repasse_confirmado' }
    })

    return res.status(201).json({ message: 'Repasse registrado com sucesso', repasse })
  } catch (error) {
    console.error('Erro ao registrar repasse:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId, parceiroId, usuarioId } = req.body

    if (!repasseId || !parceiroId || !usuarioId) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
    }

    // Simular dados do PIX
    const paymentId = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const pixData = {
      chavePix: '82988181358',
      beneficiario: {
        nome: 'VANISLAN LEOPOLDINO DA SILVA',
        cpf: '12345678901'
      },
      valor: 7.50,
      descricao: 'Repasse Parceiro - R$ 7.50',
      expiracao: 3600
    }

    return res.status(200).json({
      paymentId: paymentId,
      pixData: pixData,
      qrCode: null,
      instrucoes: [
        '1. Abra seu app bancário',
        '2. Escaneie o QR Code ou use a chave PIX: 82988181358',
        '3. Confirme o valor do repasse (10% da compra)',
        '4. Faça o pagamento do valor do repasse',
        '5. Aguarde a confirmação automática'
      ],
      status: 'pendente'
    })

  } catch (error) {
    console.error('Erro ao gerar pagamento PIX:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
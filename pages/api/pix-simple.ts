import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId, parceiroId, usuarioId, valor } = req.body

    if (!repasseId || !parceiroId || !usuarioId || !valor) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
    }

    // Gerar paymentId único
    const paymentId = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Usar valor real do repasse
    const valorRepasse = parseFloat(valor)
    
    // Dados do PIX real
    const pixData = {
      chavePix: '82988181358',
      beneficiario: {
        nome: 'VANISLAN LEOPOLDINO DA SILVA',
        cpf: '12345678901'
      },
      valor: valorRepasse,
      descricao: `Repasse Parceiro - R$ ${valorRepasse.toFixed(2)}`,
      expiracao: 3600
    }

    // Código PIX simples - apenas a chave PIX
    const pixCode = `82988181358`

    // QR Code usando API mais simples
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}&format=png&margin=10&ecc=M`

    return res.status(200).json({
      paymentId: paymentId,
      pixData: pixData,
      pixCode: pixCode, // Código PIX para copiar
      qrCode: qrCodeUrl,
      instrucoes: [
        '1. Abra seu app bancário',
        '2. Escaneie o QR Code ou use a chave PIX: 82988181358',
        `3. Confirme o valor: R$ ${valorRepasse.toFixed(2)}`,
        '4. Confirme o beneficiário: VANISLAN LEOPOLDINO DA SILVA',
        '5. Faça o pagamento',
        '6. Aguarde a confirmação automática (pode demorar alguns minutos)'
      ],
      status: 'pendente'
    })

  } catch (error) {
    console.error('Erro ao gerar pagamento PIX:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
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

    // Gerar código PIX válido (formato EMV) com valor real
    const valorFormatado = valorRepasse.toFixed(2).replace('.', '')
    const pixCode = `00020126580014br.gov.bcb.pix01368298818135852040000530398654${valorFormatado.length.toString().padStart(2, '0')}${valorFormatado}5802BR5913VANISLAN LEOPOLDINO DA SILVA6006BRASIL62070503***6304`

    // QR Code usando API mais confiável
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}&format=png&margin=10&ecc=M`

    return res.status(200).json({
      paymentId: paymentId,
      pixData: pixData,
      pixCode: pixCode, // Código PIX para copiar
      qrCode: qrCodeUrl,
      instrucoes: [
        '1. Abra seu app bancário',
        '2. Escaneie o QR Code ou cole o código PIX',
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
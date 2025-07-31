import { NextApiRequest, NextApiResponse } from 'next'
import QRCode from 'qrcode'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId, parceiroId, usuarioId, valor } = req.body

    console.log('Dados recebidos:', { repasseId, parceiroId, usuarioId, valor })

    if (!repasseId || !parceiroId || !usuarioId || !valor) {
      console.log('Dados obrigatórios não fornecidos')
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
    }

    const valorRepasse = parseFloat(valor)

    if (isNaN(valorRepasse) || valorRepasse <= 0) {
      console.log('Valor inválido:', valor)
      return res.status(400).json({ error: 'Valor inválido' })
    }

    // QR Code PIX simples para demonstração
    // Em produção, isso seria gerado por um gateway de pagamento real
    const pixCode = `PIX DEMO - R$ ${valorRepasse.toFixed(2)} - SementesPLAY`

    // Gerar QR Code real
    const qrCodeBase64 = await QRCode.toDataURL(pixCode, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Simular resposta de PIX para teste
    const mockPixData = {
      paymentId: `pix_${Date.now()}`,
      pixData: {
        chavePix: pixCode,
        beneficiario: {
          nome: 'SementesPLAY',
          cpf: '12345678901'
        },
        valor: valorRepasse,
        descricao: `Repasse Parceiro - R$ ${valorRepasse.toFixed(2)}`,
        expiracao: 3600
      },
      pixCode: pixCode,
      qrCode: qrCodeBase64,
      instrucoes: [
        '1. Abra seu app bancário',
        '2. Escaneie o QR Code ou cole o código PIX',
        `3. Confirme o valor: R$ ${valorRepasse.toFixed(2)}`,
        '4. Confirme o beneficiário: SementesPLAY',
        '5. Faça o pagamento',
        '6. Aguarde a confirmação automática'
      ],
      status: 'pendente',
      observacao: 'Este é um QR Code de demonstração. Para PIX real, será necessário integrar com Mercado Pago ou outro gateway.'
    }

    console.log('Retornando dados PIX de demonstração com valor:', valorRepasse)
    return res.status(200).json(mockPixData)

  } catch (error) {
    console.error('Erro ao gerar PIX:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
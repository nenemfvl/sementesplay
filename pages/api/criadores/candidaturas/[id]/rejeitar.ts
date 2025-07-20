import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.query
      const { observacoes } = req.body

      // Simular processamento de rejeição
      setTimeout(() => {
        res.status(200).json({
          success: true,
          message: 'Candidatura rejeitada com sucesso!',
          candidaturaId: id,
          observacoes: observacoes || 'Candidatura não atende aos critérios da plataforma.',
          dataRejeicao: new Date()
        })
      }, 1000)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({
      success: false,
      message: `Método ${req.method} não permitido`
    })
  }
} 
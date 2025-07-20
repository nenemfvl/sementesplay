import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.query

      // Simular processamento de suspensão
      setTimeout(() => {
        res.status(200).json({
          success: true,
          message: 'Criador suspenso com sucesso!',
          criadorId: id,
          dataSuspensao: new Date()
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
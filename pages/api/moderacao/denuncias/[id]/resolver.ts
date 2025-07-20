import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.query
      const { acao, observacoes } = req.body

      // Simular processamento de resolução
      setTimeout(() => {
        res.status(200).json({
          success: true,
          message: 'Denúncia resolvida com sucesso!',
          denunciaId: id,
          acao: acao,
          observacoes: observacoes || 'Denúncia analisada e resolvida.',
          dataResolucao: new Date(),
          moderador: 'Admin1'
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
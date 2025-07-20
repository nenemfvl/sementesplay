import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.query
      const { mensagem } = req.body

      // Simular processamento de resposta
      setTimeout(() => {
        res.status(200).json({
          success: true,
          message: 'Resposta enviada com sucesso!',
          ticketId: id,
          novaMensagem: {
            id: Date.now().toString(),
            autor: 'Suporte1',
            conteudo: mensagem,
            timestamp: new Date(),
            tipo: 'agente'
          }
        })
      }, 500)
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
import { NextApiRequest, NextApiResponse } from 'next'
import { enviarNotificacaoComSom } from '../../lib/notificacao'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId, tipo = 'sistema' } = req.body

    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId é obrigatório' })
    }

    // Enviar notificação de teste
    const notificacao = await enviarNotificacaoComSom(
      usuarioId,
      tipo,
      '🔊 Teste de Som',
      `Teste de notificação com som tipo "${tipo}". Se você está ouvindo isso, o sistema está funcionando!`
    )

    return res.status(200).json({ 
      success: true, 
      message: 'Notificação de teste enviada!',
      notificacao 
    })
  } catch (error) {
    console.error('Erro ao enviar notificação de teste:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // COMENTADO: Dados mockados - substituir por consulta real ao banco quando implementar sistema de chat
    // Em uma implementação real, você criaria uma tabela mensagens_chat
    /*
    const mensagens = [
      {
        id: '1',
        remetenteId: 'sistema',
        remetenteNome: 'Sistema',
        conteudo: 'Bem-vindo ao chat da comunidade SementesPLAY! 🌱',
        timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
        tipo: 'sistema'
      },
      {
        id: '2',
        remetenteId: 'sistema',
        remetenteNome: 'Sistema',
        conteudo: 'Use este espaço para conversar com outros membros!',
        timestamp: new Date(Date.now() - 1800000), // 30 min atrás
        tipo: 'sistema'
      }
    ]
    */
    const mensagens: any[] = [] // COMENTADO: Array vazio até implementar sistema real

    return res.status(200).json({ mensagens })
  } catch (error) {
    // COMENTADO: Log de debug - não afeta funcionalidade
    // console.error('Erro ao buscar mensagens:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
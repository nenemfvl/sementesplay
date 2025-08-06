import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação via token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [RECADOS-ENVIADOS] Token de autenticação não fornecido');
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }

  const token = authHeader.replace('Bearer ', '')
  
  // Buscar usuário pelo token (ID do usuário)
  const user = await prisma.usuario.findUnique({
    where: { id: token }
  });

  console.log('🔍 [RECADOS-ENVIADOS] Usuário autenticado:', user ? { id: user.id, nome: user.nome } : 'NÃO ENCONTRADO');
  
  if (!user) {
    console.log('❌ [RECADOS-ENVIADOS] Usuário não encontrado');
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  if (req.method === 'GET') {
    try {
      // Buscar recados enviados pelo usuário
      const recados = await prisma.recado.findMany({
        where: {
          remetenteId: user.id
        },
        include: {
          destinatario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        },
        orderBy: {
          dataEnvio: 'desc'
        }
      })

      const recadosFormatados = recados.map((recado: any) => ({
        id: recado.id,
        destinatarioId: recado.destinatarioId,
        destinatarioNome: recado.destinatario.nome,
        destinatarioEmail: recado.destinatario.email,
        titulo: recado.titulo,
        mensagem: recado.mensagem,
        lido: recado.lido,
        dataEnvio: recado.dataEnvio,
        dataLeitura: recado.dataLeitura,
        resposta: recado.resposta,
        dataResposta: recado.dataResposta
      }))

      return res.status(200).json({ recados: recadosFormatados })
    } catch (error) {
      console.error('❌ [RECADOS-ENVIADOS] Erro ao buscar recados:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 
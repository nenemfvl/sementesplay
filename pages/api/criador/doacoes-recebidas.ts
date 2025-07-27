import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Verificar autenticação via token Bearer
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    // Verificar se o usuário existe
    const user = await prisma.usuario.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    // Verificar se o usuário é criador
    const criador = await prisma.criador.findFirst({
      where: { usuarioId: userId }
    })

    if (!criador) {
      return res.status(403).json({ error: 'Apenas criadores podem acessar doações recebidas' })
    }

    // Buscar apenas doações recebidas pelo criador
    const doacoesRecebidas = await prisma.doacao.findMany({
      where: {
        criadorId: criador.id
      },
      include: {
        doador: {
          select: {
            id: true,
            nome: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { data: 'desc' }
    })

    // Formatar doações recebidas
    const doacoesFormatadas = doacoesRecebidas.map(doacao => ({
      id: doacao.id,
      tipo: 'recebida',
      doador: doacao.doador.nome,
      doadorId: doacao.doador.id,
      doadorAvatar: doacao.doador.avatarUrl,
      quantidade: doacao.quantidade,
      mensagem: doacao.mensagem,
      data: doacao.data
    }))

    return res.status(200).json(doacoesFormatadas)
  } catch (error) {
    console.error('Erro ao buscar doações recebidas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
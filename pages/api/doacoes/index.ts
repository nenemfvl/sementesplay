import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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

      const { doadorId, criadorId } = req.query

      // Construir filtros - SEMPRE filtrar pelo usuário logado
      const where: any = {
        doadorId: userId // Apenas doações do usuário logado
      }
      
      // Se especificado criadorId, filtrar por criador também
      if (criadorId) where.criadorId = String(criadorId)

      // Buscar doações do usuário logado
      const doacoes = await prisma.doacao.findMany({
        where,
        include: {
          doador: true,
          criador: {
            include: { usuario: true }
          }
        },
        orderBy: { data: 'desc' }
      })

      // Formatar doações
      const doacoesFormatadas = doacoes.map(doacao => ({
        id: doacao.id,
        doador: doacao.doador.nome,
        criador: doacao.criador.usuario.nome,
        quantidade: doacao.quantidade,
        mensagem: doacao.mensagem,
        data: doacao.data
      }))

      return res.status(200).json(doacoesFormatadas)
    } catch (error) {
      console.error('Erro ao buscar doações:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { doadorId, criadorId, quantidade, mensagem } = req.body

      if (!doadorId || !criadorId || !quantidade) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
      }

      // Verificar se o doador tem sementes suficientes
      const doador = await prisma.usuario.findUnique({
        where: { id: String(doadorId) }
      })

      if (!doador || doador.sementes < quantidade) {
        return res.status(400).json({ error: 'Sementes insuficientes' })
      }

      // Verificar se o doador é um criador tentando doar para si mesmo
      const criadorDoador = await prisma.criador.findFirst({
        where: { usuarioId: String(doadorId) }
      })

      if (criadorDoador && criadorDoador.id === String(criadorId)) {
        return res.status(400).json({ error: 'Você não pode doar sementes para si mesmo' })
      }

      // Buscar o usuário do criador antes da transação
      const criador = await prisma.criador.findUnique({
        where: { id: String(criadorId) },
        select: { usuarioId: true }
      })

      if (!criador) {
        return res.status(400).json({ error: 'Criador não encontrado' })
      }

      // Transação mínima - apenas operações essenciais
      const resultado = await prisma.$transaction(async (tx) => {
        // 1. Criar doação
        const doacao = await tx.doacao.create({
          data: {
            doadorId: String(doadorId),
            criadorId: String(criadorId),
            quantidade: parseInt(quantidade),
            mensagem: mensagem ? String(mensagem) : null,
            data: new Date()
          }
        })

        // 2. Atualizar sementes apenas (operação crítica)
        await Promise.all([
          tx.usuario.update({
            where: { id: String(doadorId) },
            data: { sementes: { decrement: quantidade } }
          }),
          tx.usuario.update({
            where: { id: criador.usuarioId },
            data: { sementes: { increment: quantidade } }
          })
        ])

        return doacao
      }, {
        timeout: 5000 // Timeout reduzido para 5 segundos
      })

      // Operações em background (não bloqueantes) - apenas essenciais
      setImmediate(() => {
        Promise.all([
          // Atualizar contadores e XP em background
          prisma.criador.update({
            where: { id: String(criadorId) },
            data: { doacoes: { increment: 1 } }
          }).catch(console.error),
          
          prisma.usuario.update({
            where: { id: String(doadorId) },
            data: { 
              xp: { increment: 10 },
              pontuacao: { increment: quantidade }
            }
          }).catch(console.error),
          
          prisma.usuario.update({
            where: { id: criador.usuarioId },
            data: { 
              xp: { increment: 5 },
              pontuacao: { increment: quantidade }
            }
          }).catch(console.error),

          // Histórico simplificado
          prisma.semente.create({
            data: {
              usuarioId: String(doadorId),
              quantidade: -quantidade,
              tipo: 'doacao',
              descricao: `Doação para ${criadorId}`
            }
          }).catch(console.error),
          
          prisma.semente.create({
            data: {
              usuarioId: criador.usuarioId,
              quantidade: quantidade,
              tipo: 'recebida',
              descricao: `Doação de ${doadorId}`
            }
          }).catch(console.error)
        ]).catch(console.error)
      })

      return res.status(201).json(resultado)
    } catch (error) {
      console.error('Erro ao criar doação:', error)
      console.error('Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      })
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 
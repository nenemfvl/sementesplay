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

      // Transação completa - incluindo XP e histórico para garantir consistência
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

        // 2. Buscar dados atuais dos usuários para XP
        const [doadorAtual, criadorUsuarioAtual] = await Promise.all([
          tx.usuario.findUnique({ where: { id: String(doadorId) } }),
          tx.usuario.findUnique({ where: { id: criador.usuarioId } })
        ])

        if (!doadorAtual || !criadorUsuarioAtual) {
          throw new Error('Usuários não encontrados')
        }

        // 3. Calcular novos níveis
        const doadorNovoXP = doadorAtual.xp + 10
        const criadorNovoXP = criadorUsuarioAtual.xp + 5
        const doadorNovoNivel = Math.floor(1 + Math.sqrt(doadorNovoXP / 100))
        const criadorNovoNivel = Math.floor(1 + Math.sqrt(criadorNovoXP / 100))

        // 4. Atualizar sementes, XP e estatísticas
        await Promise.all([
          // Atualizar doador
          tx.usuario.update({
            where: { id: String(doadorId) },
            data: { 
              sementes: { decrement: quantidade },
              xp: doadorNovoXP,
              nivelUsuario: doadorNovoNivel,
              pontuacao: { increment: quantidade }
            }
          }),
          // Atualizar criador (usuário)
          tx.usuario.update({
            where: { id: criador.usuarioId },
            data: { 
              sementes: { increment: quantidade },
              xp: criadorNovoXP,
              nivelUsuario: criadorNovoNivel,
              pontuacao: { increment: quantidade }
            }
          }),
          // Atualizar contador de doações do criador
          tx.criador.update({
            where: { id: String(criadorId) },
            data: { doacoes: { increment: 1 } }
          })
        ])

        // 5. Registrar histórico de XP
        await Promise.all([
          tx.historicoXP.create({
            data: {
              usuarioId: String(doadorId),
              xpGanho: 10,
              xpAnterior: doadorAtual.xp,
              xpPosterior: doadorNovoXP,
              nivelAnterior: doadorAtual.nivelUsuario,
              nivelPosterior: doadorNovoNivel,
              fonte: 'doacao',
              descricao: `Doação de ${quantidade} sementes para criador`
            }
          }),
          tx.historicoXP.create({
            data: {
              usuarioId: criador.usuarioId,
              xpGanho: 5,
              xpAnterior: criadorUsuarioAtual.xp,
              xpPosterior: criadorNovoXP,
              nivelAnterior: criadorUsuarioAtual.nivelUsuario,
              nivelPosterior: criadorNovoNivel,
              fonte: 'doacao_recebida',
              descricao: `Recebimento de doação de ${quantidade} sementes`
            }
          })
        ])

        // 6. Histórico de sementes
        await Promise.all([
          tx.semente.create({
            data: {
              usuarioId: String(doadorId),
              quantidade: -quantidade,
              tipo: 'doacao',
              descricao: `Doação para criador ${criadorId}`
            }
          }),
          tx.semente.create({
            data: {
              usuarioId: criador.usuarioId,
              quantidade: quantidade,
              tipo: 'recebida',
              descricao: `Doação recebida de usuário ${doadorId}`
            }
          })
        ])

        return doacao
      }, {
        timeout: 10000 // Timeout aumentado para 10 segundos
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
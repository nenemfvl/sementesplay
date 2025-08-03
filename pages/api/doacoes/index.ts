import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
      
      console.log('Dados recebidos:', { doadorId, criadorId, quantidade, mensagem })

      if (!doadorId || !criadorId || !quantidade) {
        console.log('Campos obrigatórios não preenchidos')
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

      // Processar doação em transação
      console.log('Iniciando transação de doação...')
      const resultado = await prisma.$transaction(async (tx) => {
        console.log('Criando doação...')
        // Criar doação
        const doacao = await tx.doacao.create({
          data: {
            doadorId: String(doadorId),
            criadorId: String(criadorId),
            quantidade: parseInt(quantidade),
            mensagem: mensagem ? String(mensagem) : null,
            data: new Date()
          }
        })
        console.log('Doação criada:', doacao)

        // Deduzir sementes do doador
        console.log('Deduzindo sementes do doador...')
        await tx.usuario.update({
          where: { id: String(doadorId) },
          data: { sementes: { decrement: quantidade } }
        })
        console.log('Sementes deduzidas do doador')

        // Buscar o usuário do criador para adicionar sementes
        console.log('Buscando usuário do criador...')
        const criador = await tx.criador.findUnique({
          where: { id: String(criadorId) },
          select: { usuarioId: true }
        })
        console.log('Criador encontrado:', criador)

        if (criador) {
          // Adicionar sementes ao usuário do criador (sementes disponíveis)
          console.log('Adicionando sementes ao usuário do criador...')
          await tx.usuario.update({
            where: { id: criador.usuarioId },
            data: { sementes: { increment: quantidade } }
          })
          console.log('Sementes adicionadas ao usuário do criador')

          // Atualizar contador de doações no criador
          console.log('Atualizando contador de doações...')
          await tx.criador.update({
            where: { id: String(criadorId) },
            data: { doacoes: { increment: 1 } }
          })
          console.log('Contador de doações atualizado')
        } else {
          console.log('Criador não encontrado para adicionar sementes')
        }

        // Registrar histórico de sementes
        console.log('Registrando histórico de sementes do doador...')
        await tx.semente.create({
          data: {
            usuarioId: String(doadorId),
            quantidade: -quantidade,
            tipo: 'doacao',
            descricao: `Doação para criador ${criadorId}`
          }
        })
        console.log('Histórico do doador registrado')

        if (criador) {
          console.log('Registrando histórico de sementes do criador...')
          await tx.semente.create({
            data: {
              usuarioId: criador.usuarioId,
              quantidade: quantidade,
              tipo: 'recebida',
              descricao: `Doação recebida de ${doadorId}`
            }
          })
          console.log('Histórico do criador registrado')
        } else {
          console.log('Criador não encontrado para registrar histórico')
        }

        // Dar XP diretamente por doação (sistema simplificado)
        console.log('Dando XP por doação...')
        const xpPorDoacao = 10 // 10 XP por doação
        
        try {
          // Atualizar XP do usuário
          await tx.usuario.update({
            where: { id: String(doadorId) },
            data: { 
              xp: { increment: xpPorDoacao }
            }
          })
          
          // Buscar dados atualizados para criar histórico
          const doadorAtualizado = await tx.usuario.findUnique({
            where: { id: String(doadorId) },
            select: { xp: true, nivelUsuario: true }
          })
          
          if (doadorAtualizado) {
            const novoNivel = Math.floor(doadorAtualizado.xp / 100) + 1
            
            // Atualizar nível se necessário
            if (novoNivel > doadorAtualizado.nivelUsuario) {
              await tx.usuario.update({
                where: { id: String(doadorId) },
                data: { nivelUsuario: novoNivel }
              })
            }
            
            // Criar histórico de XP
            await tx.historicoXP.create({
              data: {
                usuarioId: String(doadorId),
                xpGanho: xpPorDoacao,
                xpAnterior: doadorAtualizado.xp - xpPorDoacao,
                xpPosterior: doadorAtualizado.xp,
                nivelAnterior: doadorAtualizado.nivelUsuario,
                nivelPosterior: novoNivel,
                fonte: 'doacao',
                descricao: `XP ganho por doação de ${quantidade} sementes`
              }
            })
            
            // Criar notificação
            await tx.notificacao.create({
              data: {
                usuarioId: String(doadorId),
                tipo: 'doacao',
                titulo: 'XP Ganho!',
                mensagem: `Você ganhou ${xpPorDoacao} XP por fazer uma doação!`,
                lida: false
              }
            })
            
            console.log(`XP dado: ${xpPorDoacao} (Total: ${doadorAtualizado.xp}, Nível: ${novoNivel})`)
          }
        } catch (xpError) {
          console.error('Erro ao dar XP:', xpError)
          // Continuar mesmo se der erro no XP
        }

        console.log('Transação concluída com sucesso')
        return doacao
      })

      console.log('Resultado da transação:', resultado)
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
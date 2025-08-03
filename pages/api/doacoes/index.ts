import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Função para atualizar missões e conquistas
async function atualizarMissoesConquistas(tx: any, usuarioId: string, tipoAcao: string, valor?: number) {
  try {
    console.log('Atualizando missões para usuário:', usuarioId, 'tipo:', tipoAcao, 'valor:', valor)
    
    // Buscar missões ativas relacionadas à ação
    let missoes = []
    
    if (tipoAcao === 'doacao') {
      // Para doações, buscar missões que são relacionadas a doações
      missoes = await tx.missao.findMany({
        where: {
          ativa: true,
          OR: [
            { titulo: { contains: 'Doação' } },
            { titulo: { contains: 'Doador' } },
            { descricao: { contains: 'doação' } }
          ]
        }
      })
    } else {
      // Para outros tipos, usar o tipo original
      missoes = await tx.missao.findMany({
        where: {
          ativa: true,
          tipo: tipoAcao
        }
      })
    }

    console.log('Missões encontradas:', missoes.length)

    for (const missao of missoes) {
      console.log('Processando missão:', missao.titulo, 'objetivo:', missao.objetivo)
      
      // Verificar se o usuário já tem progresso nesta missão
      let missaoUsuario = await tx.missaoUsuario.findFirst({
        where: {
          missaoId: missao.id,
          usuarioId: usuarioId
        }
      })

      if (!missaoUsuario) {
        console.log('Criando novo progresso para missão:', missao.titulo)
        // Criar novo progresso
        missaoUsuario = await tx.missaoUsuario.create({
          data: {
            missaoId: missao.id,
            usuarioId: usuarioId,
            progresso: 0,
            concluida: false
          }
        })
      }

      console.log('Progresso atual:', missaoUsuario.progresso, 'concluída:', missaoUsuario.concluida)

      // Atualizar progresso baseado no tipo de ação
      let novoProgresso = missaoUsuario.progresso
      let concluida = missaoUsuario.concluida

      switch (tipoAcao) {
        case 'doacao':
          novoProgresso += 1 // Contar número de doações
          console.log('Novo progresso após doação:', novoProgresso, 'objetivo:', missao.objetivo)
          if (novoProgresso >= missao.objetivo && !concluida) {
            console.log('Missão completada! Criando conquista e dando recompensa...')
            concluida = true
            // Criar conquista se a missão for completada
            await criarConquistaSeNecessario(tx, usuarioId, missao.titulo)
            // Dar recompensa da missão (removido - agora apenas XP)
            // await darRecompensaMissao(tx, usuarioId, missao.recompensa, missao.titulo, missao.emblema)
          }
          break
        case 'valor_doacao':
          if (valor) {
            novoProgresso += valor // Somar valor das doações
            console.log('Novo progresso após valor:', novoProgresso, 'objetivo:', missao.objetivo)
            if (novoProgresso >= missao.objetivo && !concluida) {
              console.log('Missão completada! Criando conquista e dando recompensa...')
              concluida = true
              await criarConquistaSeNecessario(tx, usuarioId, missao.titulo)
              // Dar recompensa da missão (removido - agora apenas XP)
              // await darRecompensaMissao(tx, usuarioId, missao.recompensa, missao.titulo, missao.emblema)
            }
          }
          break
      }

      // Atualizar missão do usuário
      await tx.missaoUsuario.update({
        where: { id: missaoUsuario.id },
        data: {
          progresso: novoProgresso,
          concluida: concluida,
          dataConclusao: concluida && !missaoUsuario.concluida ? new Date() : missaoUsuario.dataConclusao
        }
      })
      
      console.log('Missão atualizada - progresso:', novoProgresso, 'concluída:', concluida)
    }
  } catch (error) {
    console.error('Erro ao atualizar missões:', error)
  }
}

// Função para dar recompensa da missão
async function darRecompensaMissao(tx: any, usuarioId: string, recompensa: number, tituloMissao: string, emblema?: string) {
  try {
    if (recompensa > 0) {
      console.log('Dando recompensa de', recompensa, 'sementes para missão:', tituloMissao)
      
      // Adicionar sementes ao usuário
      await tx.usuario.update({
        where: { id: usuarioId },
        data: { sementes: { increment: recompensa } }
      })
      
      // Registrar histórico de sementes
      await tx.semente.create({
        data: {
          usuarioId: usuarioId,
          quantidade: recompensa,
          tipo: 'recompensa_missao',
          descricao: `Recompensa da missão: ${tituloMissao}`
        }
      })
    }
    
    if (emblema) {
      console.log('Dando emblema', emblema, 'para missão:', tituloMissao)
      // Salvar emblema do usuário
      await tx.emblemaUsuario.create({
        data: {
          usuarioId: usuarioId,
          emblema: emblema,
          titulo: tituloMissao
        }
      })
      console.log('Emblema salvo com sucesso!')
    }
    
    console.log('Recompensa dada com sucesso!')
  } catch (error) {
    console.error('Erro ao dar recompensa:', error)
  }
}

// Função para criar conquista se necessário
async function criarConquistaSeNecessario(tx: any, usuarioId: string, tituloMissao: string) {
  try {
    console.log('Tentando criar conquista para missão:', tituloMissao, 'usuário:', usuarioId)
    
    // Mapear missões para conquistas
    const mapeamentoConquistas: { [key: string]: string } = {
      'Primeira Doação': 'Primeira Doação',
      'Doador Frequente': 'Doador Frequente',
      'Apoiador de Criadores': 'Apoiador de Criadores'
    }

    const nomeConquista = mapeamentoConquistas[tituloMissao]
    console.log('Nome da conquista mapeada:', nomeConquista)
    
    if (!nomeConquista) {
      console.log('Nenhuma conquista mapeada para missão:', tituloMissao)
      return
    }

    // Buscar conquista
    const conquista = await tx.conquista.findFirst({
      where: { titulo: nomeConquista }
    })

    console.log('Conquista encontrada:', conquista)

    if (conquista) {
      // Verificar se o usuário já tem esta conquista
      const conquistaExistente = await tx.conquistaUsuario.findFirst({
        where: {
          conquistaId: conquista.id,
          usuarioId: usuarioId
        }
      })

      console.log('Conquista existente para usuário:', conquistaExistente)

      if (!conquistaExistente) {
        console.log('Criando nova conquista para usuário...')
        // Criar conquista para o usuário
        const novaConquista = await tx.conquistaUsuario.create({
          data: {
            conquistaId: conquista.id,
            usuarioId: usuarioId,
            dataConquista: new Date()
          }
        })
        console.log('Conquista criada com sucesso:', novaConquista)
      } else {
        console.log('Usuário já possui esta conquista')
      }
    } else {
      console.log('Conquista não encontrada no banco de dados:', nomeConquista)
    }
  } catch (error) {
    console.error('Erro ao criar conquista:', error)
  }
}

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

        // Atualizar missões e conquistas do doador
        console.log('Atualizando missões e conquistas...')
        await atualizarMissoesConquistas(tx, String(doadorId), 'doacao', quantidade)
        console.log('Missões e conquistas atualizadas')

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
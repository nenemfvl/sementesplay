import { prisma } from '../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do criador é obrigatório' })
  }

  if (req.method === 'PUT') {
    try {
      const { redesSociais, bio } = req.body

      // Verificar se o usuário está autenticado e é o próprio criador
      const token = req.headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return res.status(401).json({ error: 'Token de autenticação necessário' })
      }

      // Buscar o criador pelo ID do usuário ou ID do criador
      let criador = await prisma.criador.findUnique({
        where: { id },
        include: { usuario: true }
      })

      // Se não encontrou pelo ID direto, tenta buscar pelo usuarioId
      if (!criador) {
        criador = await prisma.criador.findUnique({
          where: { usuarioId: id },
          include: { usuario: true }
        })
      }

      if (!criador) {
        return res.status(404).json({ error: 'Criador não encontrado' })
      }

      // Atualizar os dados do criador
      const dadosAtualizados: any = {}
      
      if (redesSociais) {
        dadosAtualizados.redesSociais = JSON.stringify(redesSociais)
      }
      
      if (bio) {
        dadosAtualizados.bio = bio
      }

      const criadorAtualizado = await prisma.criador.update({
        where: { id: criador.id },
        data: dadosAtualizados,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatarUrl: true,
              nivel: true
            }
          }
        }
      })

      // Parsear redes sociais para retorno
      let redesSociaisFormatadas = {}
      try {
        redesSociaisFormatadas = JSON.parse(criadorAtualizado.redesSociais || '{}')
      } catch (e) {
        redesSociaisFormatadas = {}
      }

      res.status(200).json({
        success: true,
        criador: {
          id: criadorAtualizado.id,
          nome: criadorAtualizado.usuario.nome,
          nivel: criadorAtualizado.usuario.nivel,
          avatar: criadorAtualizado.usuario.avatarUrl,
          bio: criadorAtualizado.bio,
          redesSociais: redesSociaisFormatadas
        }
      })
    } catch (error) {
      console.error('Erro ao atualizar criador:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
    return
  }

  // Método GET (código existente)
  console.log('API criador: Buscando criador com ID:', id)

  try {
    // Buscar o criador pelo ID do usuário ou ID do criador
    let criador = await prisma.criador.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
            nivel: true,
            sementes: true // Adicionando sementes do usuário
          }
        }
      }
    })

    // Se não encontrou pelo ID direto, tenta buscar pelo usuarioId
    if (!criador) {
      criador = await prisma.criador.findUnique({
        where: { usuarioId: id },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatarUrl: true,
              nivel: true,
              sementes: true // Adicionando sementes do usuário
            }
          }
        }
      })
    }

    console.log('API criador: Criador encontrado:', criador ? 'SIM' : 'NÃO')

    if (!criador) {
      console.log('API criador: Criador não encontrado para ID:', id)
      return res.status(404).json({ error: 'Criador não encontrado' })
    }

    console.log('API criador: Processando dados do criador...')

    // Buscar doações separadamente para evitar problemas
    const doacoes = await prisma.doacao.findMany({
      where: { criadorId: criador.id },
      select: {
        id: true,
        quantidade: true
      }
    })

    console.log('API criador: Doações encontradas:', doacoes.length)

    // Calcular estatísticas
    const totalSementesRecebidas = doacoes.reduce((sum, doacao) => sum + doacao.quantidade, 0)
    const numeroDoacoes = doacoes.length
    const sementesDisponiveis = criador.usuario.sementes // Saldo real do usuário

    console.log('API criador: Estatísticas calculadas - Sementes Recebidas:', totalSementesRecebidas, 'Sementes Disponíveis:', sementesDisponiveis, 'Doações:', numeroDoacoes)

    // Buscar posição no ranking usando EXATAMENTE o mesmo critério da página de status
    const ranking = await prisma.criador.findMany({
      where: {
        usuario: {
          nivel: {
            in: ['criador-supremo', 'criador-parceiro', 'criador-comum', 'criador-iniciante']
          }
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
            nivel: true,
            pontuacao: true,
            sementes: true
          }
        },
        doacoesRecebidas: true
      }
    })

    // Calcular pontuação composta para cada criador (EXATAMENTE igual à página de status)
    const criadoresComPontuacao = await Promise.all(ranking.map(async c => {
      try {
        // Pontuação base: sementes recebidas (1 semente = 1 ponto)
        const sementesRecebidas = c.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
        
        // Pontos do campo pontuacao do usuário (se ele também doar)
        const pontosUsuario = c.usuario.pontuacao || 0
        
        // Buscar dados adicionais do criador (mesmo que a API de ranking)
        const [conteudos, enquetes, recadosPublicos] = await Promise.all([
          // Total de visualizações dos conteúdos
          prisma.conteudo.aggregate({
            where: { criadorId: c.id },
            _sum: { visualizacoes: true }
          }).catch(() => ({ _sum: { visualizacoes: 0 } })),
          
          // Quantidade de enquetes criadas
          prisma.enquete.count({
            where: { criadorId: c.id }
          }).catch(() => 0),
          
          // Quantidade de recados públicos (caixa de perguntas)
          prisma.recado.count({
            where: { 
              destinatarioId: c.usuario.id,
              publico: true 
            }
          }).catch(() => 0)
        ])
        
        // Calcular pontuação por visualizações (1 visualização = 0.1 ponto)
        const pontosVisualizacoes = Math.floor((conteudos._sum.visualizacoes || 0) * 0.1)
        
        // Pontos por enquetes (5 pontos por enquete)
        const pontosEnquetes = enquetes * 5
        
        // Pontos por recados públicos (2 pontos por recado público)
        const pontosRecadosPublicos = recadosPublicos * 2
        
        // Pontuação total composta (EXATAMENTE igual à página de status)
        const pontuacaoTotal = sementesRecebidas + pontosUsuario + pontosVisualizacoes + pontosEnquetes + pontosRecadosPublicos
        
        return {
          id: c.id,
          pontuacaoTotal
        }
      } catch (error) {
        console.error(`Erro ao calcular pontuação do criador ${c.id}:`, error)
        // Em caso de erro, usar pontuação básica
        const sementesRecebidas = c.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
        const pontosUsuario = c.usuario.pontuacao || 0
        return {
          id: c.id,
          pontuacaoTotal: sementesRecebidas + pontosUsuario
        }
      }
    }))

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    const posicao = criadoresComPontuacao.findIndex(item => item.id === criador.id) + 1

    console.log('API criador: Posição no ranking:', posicao, 'para criador:', criador.usuario.nome, '- FORCE DEPLOY')

    // Parsear redes sociais do JSON string
    let redesSociais = {}
    try {
      redesSociais = JSON.parse(criador.redesSociais || '{}')
    } catch (e) {
      console.log('API criador: Erro ao parsear redes sociais:', e)
      redesSociais = {}
    }

    // Formatar dados para o frontend
    const criadorFormatado = {
      id: criador.id,
      usuarioId: criador.usuarioId, // Adicionando o usuarioId
      nome: criador.usuario.nome,
      nivel: criador.usuario.nivel,
      avatar: criador.usuario.avatarUrl,
      bio: criador.bio,
      sementes: sementesDisponiveis, // Usando sementes disponíveis do usuário
      sementesRecebidas: totalSementesRecebidas, // Total de sementes recebidas em doações
      apoiadores: criador.apoiadores || 0,
      doacoes: numeroDoacoes,
      posicao: posicao,
      redesSociais: redesSociais
    }

    console.log('API criador: Dados formatados com sucesso')

    res.status(200).json({ criador: criadorFormatado })
  } catch (error) {
    console.error('Erro ao buscar dados do criador:', error)
    console.error('Detalhes do erro:', error instanceof Error ? error.message : String(error))
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error instanceof Error ? error.message : String(error) 
    })
  }
} 
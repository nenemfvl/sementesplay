import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { usuarioId } = req.query

  if (!usuarioId || typeof usuarioId !== 'string') {
    return res.status(400).json({ error: 'ID do usuário é obrigatório' })
  }

  try {
    // Verificar autenticação - tentar cookie primeiro, depois header
    let user = null

    // Método 1: Cookie
    const userCookie = req.cookies.sementesplay_user
    if (userCookie) {
      try {
        user = JSON.parse(decodeURIComponent(userCookie))
      } catch (error) {
        // Erro silencioso
      }
    }

    // Método 2: Header Authorization (fallback)
    if (!user && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '')
        user = JSON.parse(decodeURIComponent(token))
      } catch (error) {
        // Erro silencioso
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Verificar se é admin
    if (Number(user.nivel) < 5) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta área.' })
    }

    // Buscar detalhes do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        nivel: true,
        sementes: true,
        pontuacao: true,
        dataCriacao: true,
        ultimoLogin: true,
        xp: true,
        nivelUsuario: true,
        streakLogin: true,
        titulo: true,
        avatarUrl: true,
        suspenso: true,
        dataSuspensao: true,
        motivoSuspensao: true
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Verificar se o usuário é criador
    const criador = await prisma.criador.findUnique({
      where: { usuarioId: usuarioId }
    })

    // Calcular estatísticas do usuário
    const [
      totalDoacoesFeitas,
      totalDoacoesRecebidas,
      valorTotalDoacoesFeitas,
      valorTotalDoacoesRecebidas,
      totalConteudos,
      totalComentarios,
      totalMissoesConcluidas
    ] = await Promise.all([
      // Doações feitas pelo usuário (quantidade)
      prisma.doacao.count({
        where: { doadorId: usuarioId }
      }),
      
      // Doações recebidas (se for criador) - quantidade
      criador ? prisma.doacao.count({
        where: { criadorId: criador.id }
      }) : 0,
      
      // Valor total das doações feitas
      prisma.doacao.aggregate({
        where: { doadorId: usuarioId },
        _sum: { quantidade: true }
      }).then(result => result._sum.quantidade || 0),
      
      // Valor total das doações recebidas (se for criador)
      criador ? prisma.doacao.aggregate({
        where: { criadorId: criador.id },
        _sum: { quantidade: true }
      }).then(result => result._sum.quantidade || 0) : 0,
      
      // Conteúdos criados (se for criador)
      criador ? prisma.conteudo.count({
        where: { criadorId: criador.id }
      }) : 0,
      
      // Comentários feitos
      prisma.comentario.count({
        where: { usuarioId: usuarioId }
      }),
      
      // Missões concluídas
      prisma.missaoUsuario.count({
        where: {
          usuarioId: usuarioId,
          concluida: true
        }
      })
    ])

    // Determinar status do usuário
    let status: 'ativo' | 'banido' | 'pendente' | 'suspenso' = 'ativo'
    
    if (usuario.suspenso) {
      status = 'suspenso'
    } else if (usuario.tipo === 'banido') {
      status = 'banido'
    } else if (usuario.tipo === 'pendente') {
      status = 'pendente'
    }

    const usuarioFormatado = {
      ...usuario,
      status
    }

    const estatisticas = {
      totalDoacoesFeitas,
      totalDoacoesRecebidas,
      valorTotalDoacoesFeitas,
      valorTotalDoacoesRecebidas,
      totalConteudos,
      totalComentarios,
      totalMissoesConcluidas,
      eCriador: !!criador
    }

    return res.status(200).json({
      usuario: usuarioFormatado,
      estatisticas
    })

  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do usuário:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

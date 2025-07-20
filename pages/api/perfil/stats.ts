import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar estatísticas de doações
    const doacoes = await prisma.doacao.findMany({
      where: {
        doadorId: String(usuarioId)
      },
      include: {
        criador: {
          include: {
            usuario: true
          }
        }
      },
      orderBy: {
        data: 'desc'
      },
      take: 10
    })

    // Buscar estatísticas de cashback
    const cashbacks = await prisma.transacao.findMany({
      where: {
        usuarioId: String(usuarioId),
        tipo: 'CASHBACK',
        status: 'aprovada'
      },
      orderBy: {
        data: 'desc'
      },
      take: 10
    })

    // Calcular totais
    const totalDoacoes = doacoes.reduce((sum, d) => sum + d.quantidade, 0)
    const criadoresApoiados = new Set(doacoes.map(d => d.criadorId)).size
    const cashbacksResgatados = cashbacks.length

    // Atividades recentes
    const atividadesRecentes = [
      ...doacoes.map(d => ({
        descricao: `Doou ${d.quantidade} Sementes para ${d.criador.usuario.nome}`,
        data: d.data.toLocaleDateString('pt-BR')
      })),
      ...cashbacks.map(c => ({
        descricao: `Resgatou ${c.valor} Sementes do código ${c.codigoParceiro}`,
        data: c.data.toLocaleDateString('pt-BR')
      }))
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5)

    // Próximas conquistas (mockadas por enquanto)
    const proximasConquistas = [
      {
        nome: 'Primeira Doação',
        descricao: 'Faça sua primeira doação',
        progresso: doacoes.length > 0 ? 100 : 0
      },
      {
        nome: 'Doador Frequente',
        descricao: 'Faça 10 doações',
        progresso: Math.min((doacoes.length / 10) * 100, 100)
      },
      {
        nome: 'Apoiador de Criadores',
        descricao: 'Apoie 5 criadores diferentes',
        progresso: Math.min((criadoresApoiados / 5) * 100, 100)
      }
    ]

    // Conquistas (mockadas por enquanto)
    const conquistas = [
      {
        nome: 'Primeira Doação',
        descricao: 'Realizou sua primeira doação',
        desbloqueada: doacoes.length > 0
      },
      {
        nome: 'Doador Frequente',
        descricao: 'Realizou 10 doações',
        desbloqueada: doacoes.length >= 10
      },
      {
        nome: 'Apoiador de Criadores',
        descricao: 'Apoiou 5 criadores diferentes',
        desbloqueada: criadoresApoiados >= 5
      },
      {
        nome: 'Cashback Master',
        descricao: 'Resgatou 5 códigos de cashback',
        desbloqueada: cashbacksResgatados >= 5
      }
    ]

    // Histórico de doações
    const historicoDoacoes = doacoes.map(d => ({
      criador: d.criador.usuario.nome,
      valor: d.quantidade,
      data: d.data.toLocaleDateString('pt-BR')
    }))

    // Histórico de cashback
    const historicoCashback = cashbacks.map(c => ({
      codigo: c.codigoParceiro || 'CASHBACK',
      valor: c.valor,
      data: c.data.toLocaleDateString('pt-BR')
    }))

    return res.status(200).json({
      totalDoacoes,
      criadoresApoiados,
      cashbacksResgatados,
      atividadesRecentes,
      proximasConquistas,
      conquistas,
      historicoDoacoes,
      historicoCashback
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas do perfil:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
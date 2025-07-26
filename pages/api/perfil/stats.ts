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

    // Buscar missões do usuário
    const missoesUsuario = await prisma.missaoUsuario.findMany({
      where: {
        usuarioId: String(usuarioId)
      },
      include: {
        missao: true
      },
      orderBy: {
        dataConclusao: 'desc'
      }
    })

    // Buscar conquistas do usuário
    const conquistasUsuario = await prisma.conquistaUsuario.findMany({
      where: {
        usuarioId: String(usuarioId)
      },
      include: {
        conquista: true
      },
      orderBy: {
        dataConquista: 'desc'
      }
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
      })),
      ...missoesUsuario.filter(m => m.concluida).map(m => ({
        descricao: `Completou a missão: ${m.missao.titulo}`,
        data: m.dataConclusao?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR')
      })),
      ...conquistasUsuario.map(c => ({
        descricao: `Desbloqueou a conquista: ${c.conquista.titulo}`,
        data: c.dataConquista.toLocaleDateString('pt-BR')
      }))
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5)

    // Próximas conquistas baseadas em missões ativas
    const proximasConquistas = missoesUsuario.map(m => ({
      nome: m.missao.titulo,
      descricao: m.missao.descricao,
      progresso: m.concluida ? 100 : Math.min((m.progresso / m.missao.recompensa) * 100, 100)
    }))

    // Conquistas reais do usuário
    const conquistas = conquistasUsuario.map(c => ({
      nome: c.conquista.titulo,
      descricao: c.conquista.descricao,
      desbloqueada: true,
      dataConquista: c.dataConquista
    }))

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
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar atividades recentes das últimas 24 horas
    const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [
      doacoesRecentes,
      novosUsuarios,
      cashbacksRecentes,
      transacoesRecentes
    ] = await Promise.all([
      // Doações recentes
      prisma.doacao.findMany({
        where: {
          data: {
            gte: vinteQuatroHorasAtras
          }
        },
        include: {
          doador: true,
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
      }),

      // Novos usuários
      prisma.usuario.findMany({
        where: {
          dataCriacao: {
            gte: vinteQuatroHorasAtras
          }
        },
        orderBy: {
          dataCriacao: 'desc'
        },
        take: 10
      }),

      // Cashbacks recentes
      prisma.transacao.findMany({
        where: {
          tipo: 'CASHBACK',
          data: {
            gte: vinteQuatroHorasAtras
          }
        },
        include: {
          usuario: true
        },
        orderBy: {
          data: 'desc'
        },
        take: 10
      }),

      // Outras transações
      prisma.transacao.findMany({
        where: {
          tipo: {
            not: 'CASHBACK'
          },
          data: {
            gte: vinteQuatroHorasAtras
          }
        },
        include: {
          usuario: true
        },
        orderBy: {
          data: 'desc'
        },
        take: 10
      })
    ])

    // Combinar e formatar atividades
    const atividades: any[] = []

    // Adicionar doações
    doacoesRecentes.forEach(doacao => {
      atividades.push({
        id: doacao.id,
        tipo: 'doacao',
        descricao: `${doacao.doador.nome} doou ${doacao.quantidade} Sementes para ${doacao.criador.usuario.nome}`,
        timestamp: doacao.data,
        usuario: doacao.doador.nome,
        valor: doacao.quantidade
      })
    })

    // Adicionar novos usuários
    novosUsuarios.forEach(usuario => {
      atividades.push({
        id: usuario.id,
        tipo: 'usuario',
        descricao: `Novo usuário registrado: ${usuario.nome}`,
        timestamp: usuario.dataCriacao,
        usuario: usuario.nome
      })
    })

    // Adicionar cashbacks
    cashbacksRecentes.forEach(cashback => {
      atividades.push({
        id: cashback.id,
        tipo: 'cashback',
        descricao: `${cashback.usuario.nome} resgatou ${cashback.valor} Sementes via cashback`,
        timestamp: cashback.data,
        usuario: cashback.usuario.nome,
        valor: cashback.valor
      })
    })

    // Adicionar outras transações
    transacoesRecentes.forEach(transacao => {
      atividades.push({
        id: transacao.id,
        tipo: 'transacao',
        descricao: `${transacao.usuario.nome} realizou transação de ${transacao.valor} Sementes`,
        timestamp: transacao.data,
        usuario: transacao.usuario.nome,
        valor: transacao.valor
      })
    })

    // Ordenar por timestamp (mais recente primeiro)
    atividades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Retornar apenas as 20 atividades mais recentes
    const atividadesRecentes = atividades.slice(0, 20)

    return res.status(200).json({ atividades: atividadesRecentes })
  } catch (error) {
    console.error('Erro ao buscar atividade recente:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
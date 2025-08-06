import { prisma } from '../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { periodo } = req.query
    const periodoStr = String(periodo || '7d')

    // Calcular datas baseadas no período
    const agora = new Date()
    let dataInicio: Date
    let dataInicioAnterior: Date

    switch (periodoStr) {
      case '7d':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
        dataInicioAnterior = new Date(agora.getTime() - 14 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
        dataInicioAnterior = new Date(agora.getTime() - 60 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dataInicio = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000)
        dataInicioAnterior = new Date(agora.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        dataInicio = new Date(agora.getTime() - 365 * 24 * 60 * 60 * 1000)
        dataInicioAnterior = new Date(agora.getTime() - 730 * 24 * 60 * 60 * 1000)
        break
      default:
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
        dataInicioAnterior = new Date(agora.getTime() - 14 * 24 * 60 * 60 * 1000)
    }

    // Buscar dados do período atual
    const [
      novosUsuarios,
      doacoes,
      sementesCirculacao,
      cashbacksResgatados,
      criadoresAtivos
    ] = await Promise.all([
      // Novos usuários
      prisma.usuario.count({
        where: {
          dataCriacao: {
            gte: dataInicio
          }
        }
      }),

      // Doações
      prisma.doacao.count({
        where: {
          data: {
            gte: dataInicio
          }
        }
      }),

      // Sementes em circulação
      prisma.usuario.aggregate({
        _sum: {
          sementes: true
        }
      }),

      // Cashbacks resgatados
      prisma.transacao.count({
        where: {
          tipo: 'CASHBACK',
          status: 'aprovada',
          data: {
            gte: dataInicio
          }
        }
      }),

      // Criadores ativos
      prisma.criador.count()
    ])

    // Buscar dados do período anterior para calcular crescimento
    const [
      novosUsuariosAnterior,
      doacoesAnterior
    ] = await Promise.all([
      prisma.usuario.count({
        where: {
          dataCriacao: {
            gte: dataInicioAnterior,
            lt: dataInicio
          }
        }
      }),

      prisma.doacao.count({
        where: {
          data: {
            gte: dataInicioAnterior,
            lt: dataInicio
          }
        }
      })
    ])

    // Calcular crescimento percentual
    const crescimentoUsuarios = novosUsuariosAnterior > 0 
      ? ((novosUsuarios - novosUsuariosAnterior) / novosUsuariosAnterior) * 100 
      : novosUsuarios > 0 ? 100 : 0

    const crescimentoDoacoes = doacoesAnterior > 0 
      ? ((doacoes - doacoesAnterior) / doacoesAnterior) * 100 
      : doacoes > 0 ? 100 : 0

    // Calcular receita total (mockado - em uma implementação real seria baseado em transações reais)
    const receitaTotal = doacoes * 0.1 // Simulação: 10% de cada doação

    const relatorioData = {
      periodo: periodoStr,
      novosUsuarios,
      doacoes,
      sementesCirculacao: sementesCirculacao._sum.sementes || 0,
      cashbacksResgatados,
      criadoresAtivos,
      receitaTotal,
      crescimentoUsuarios: Math.round(crescimentoUsuarios * 100) / 100,
      crescimentoDoacoes: Math.round(crescimentoDoacoes * 100) / 100
    }

    return res.status(200).json(relatorioData)
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar ou criar configuração de ciclos
    let configCiclos = await prisma.configuracaoCiclos.findFirst()
    
    if (!configCiclos) {
      // Criar configuração inicial
      const dataInicio = new Date()
      configCiclos = await prisma.configuracaoCiclos.create({
        data: {
          dataInicioCiclo: dataInicio,
          dataInicioSeason: dataInicio,
          numeroSeason: 1,
          numeroCiclo: 1
        }
      })
    }

    const agora = new Date()
    
    // Calcular dias restantes para o ciclo (15 dias)
    const dataFimCiclo = new Date(configCiclos.dataInicioCiclo)
    dataFimCiclo.setDate(dataFimCiclo.getDate() + 15)
    
    const diasRestantesCiclo = Math.max(0, Math.ceil((dataFimCiclo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Calcular dias restantes para a season (3 meses)
    const dataFimSeason = new Date(configCiclos.dataInicioSeason)
    dataFimSeason.setMonth(dataFimSeason.getMonth() + 3)
    
    const diasRestantesSeason = Math.max(0, Math.ceil((dataFimSeason.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Verificar se precisa resetar o ciclo
    const precisaResetarCiclo = agora >= dataFimCiclo
    
    // Verificar se precisa resetar a season
    const precisaResetarSeason = agora >= dataFimSeason
    
    // Se estiver pausado, não executar resets automáticos
    if (configCiclos.pausado) {
      return res.status(200).json({
        diasRestantesCiclo: Math.max(0, diasRestantesCiclo),
        diasRestantesSeason: Math.max(0, diasRestantesSeason),
        numeroCiclo: configCiclos.numeroCiclo,
        numeroSeason: configCiclos.numeroSeason,
        dataInicioCiclo: configCiclos.dataInicioCiclo,
        dataInicioSeason: configCiclos.dataInicioSeason,
        pausado: true,
        resetou: false
      })
    }
    
    // Se precisar resetar, fazer o reset
    if (precisaResetarCiclo || precisaResetarSeason) {
      if (precisaResetarSeason) {
        // Reset da season - resetar rankings, níveis de criadores e conteúdos
        await prisma.configuracaoCiclos.update({
          where: { id: configCiclos.id },
          data: {
            dataInicioCiclo: agora,
            dataInicioSeason: agora,
            numeroSeason: configCiclos.numeroSeason + 1,
            numeroCiclo: 1
          }
        })
        
        // Resetar rankings
        await prisma.rankingCiclo.deleteMany()
        await prisma.rankingSeason.deleteMany()
        
        // Resetar APENAS níveis de criadores para 'criador-iniciante'
        await prisma.usuario.updateMany({
          where: {
            nivel: {
              in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
            }
          },
          data: {
            nivel: 'criador-iniciante'
          }
        })
        
        // NOVO: Zerar pontuações de todos os usuários
        await prisma.usuario.updateMany({
          data: {
            pontuacao: 0
          }
        })
        
        // NOVO: Zerar doações recebidas
        await prisma.doacao.deleteMany()
        
        // NOVO: Zerar histórico de sementes
        await prisma.semente.deleteMany()
        
        // Limpar conteúdos para dar oportunidade igual a todos
        await prisma.conteudo.deleteMany()
        await prisma.conteudoParceiro.deleteMany()
        
        // NOVO: Resetar vendas dos parceiros
        await prisma.compraParceiro.deleteMany()
        await prisma.repasseParceiro.deleteMany()
        await prisma.solicitacaoCompra.deleteMany()
        await prisma.codigoCashback.deleteMany()
        
        // Resetar campos de vendas na tabela Parceiro
        await prisma.parceiro.updateMany({
          data: {
            totalVendas: 0,
            codigosGerados: 0,
            saldoDevedor: 0
          }
        })
        
        configCiclos = await prisma.configuracaoCiclos.findFirst()
      } else if (precisaResetarCiclo) {
        // Reset apenas do ciclo - resetar ranking, níveis de criadores e conteúdos
        await prisma.configuracaoCiclos.update({
          where: { id: configCiclos.id },
          data: {
            dataInicioCiclo: agora,
            numeroCiclo: configCiclos.numeroCiclo + 1
          }
        })
        
        // Resetar ranking do ciclo
        await prisma.rankingCiclo.deleteMany()
        
        // Resetar APENAS níveis de criadores para 'criador-iniciante'
        await prisma.usuario.updateMany({
          where: {
            nivel: {
              in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
            }
          },
          data: {
            nivel: 'criador-iniciante'
          }
        })
        
        // NOVO: Zerar pontuações de todos os usuários
        await prisma.usuario.updateMany({
          data: {
            pontuacao: 0
          }
        })
        
        // NOVO: Zerar doações recebidas
        await prisma.doacao.deleteMany()
        
        // NOVO: Zerar histórico de sementes
        await prisma.semente.deleteMany()
        
        // Limpar conteúdos para dar oportunidade igual a todos
        await prisma.conteudo.deleteMany()
        await prisma.conteudoParceiro.deleteMany()
        
        // NOVO: Resetar vendas dos parceiros
        await prisma.compraParceiro.deleteMany()
        await prisma.repasseParceiro.deleteMany()
        await prisma.solicitacaoCompra.deleteMany()
        await prisma.codigoCashback.deleteMany()
        
        // Resetar campos de vendas na tabela Parceiro
        await prisma.parceiro.updateMany({
          data: {
            totalVendas: 0,
            codigosGerados: 0,
            saldoDevedor: 0
          }
        })
        
        configCiclos = await prisma.configuracaoCiclos.findFirst()
      }
      
      // Recalcular após reset
      const novaDataFimCiclo = new Date(configCiclos!.dataInicioCiclo)
      novaDataFimCiclo.setDate(novaDataFimCiclo.getDate() + 15)
      
      const novaDataFimSeason = new Date(configCiclos!.dataInicioSeason)
      novaDataFimSeason.setMonth(novaDataFimSeason.getMonth() + 3)
      
      return res.status(200).json({
        diasRestantesCiclo: 15,
        diasRestantesSeason: Math.ceil((novaDataFimSeason.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)),
        numeroCiclo: configCiclos!.numeroCiclo,
        numeroSeason: configCiclos!.numeroSeason,
        dataInicioCiclo: configCiclos!.dataInicioCiclo,
        dataInicioSeason: configCiclos!.dataInicioSeason,
        resetou: true
      })
    }

    return res.status(200).json({
      diasRestantesCiclo,
      diasRestantesSeason,
      numeroCiclo: configCiclos.numeroCiclo,
      numeroSeason: configCiclos.numeroSeason,
      dataInicioCiclo: configCiclos.dataInicioCiclo,
      dataInicioSeason: configCiclos.dataInicioSeason,
      pausado: configCiclos.pausado || false,
      resetou: false
    })
  } catch (error) {
    console.error('Erro ao buscar informações dos ciclos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 
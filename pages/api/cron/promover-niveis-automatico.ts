import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

// Função para determinar novo nível baseado na posição
function determinarNovoNivel(posicao: number, totalCriadores: number): string {
  if (totalCriadores === 1) return 'criador-supremo'
  if (posicao === 1) return 'criador-supremo'
  if (posicao <= Math.ceil(totalCriadores * 0.1)) return 'criador-supremo' // Top 10%
  if (posicao <= Math.ceil(totalCriadores * 0.3)) return 'criador-parceiro' // Top 30%
  if (posicao <= Math.ceil(totalCriadores * 0.6)) return 'criador-comum' // Top 60%
  return 'criador-iniciante'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar se é uma requisição do cron (Railway, Vercel, etc.)
  const cronSecret = req.headers['x-cron-secret'] || req.query.secret
  
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  try {
    console.log('🕐 CRON JOB: INICIANDO PROMOÇÃO AUTOMÁTICA DE NÍVEIS...')
    console.log(`📅 Data/Hora: ${new Date().toISOString()}`)

    // Buscar todos os criadores com seus dados
    const criadores = await prisma.criador.findMany({
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
            nivel: true,
            pontuacao: true
          }
        },
        doacoesRecebidas: {
          select: {
            quantidade: true
          }
        }
      }
    })

    console.log(`📊 Total de criadores encontrados: ${criadores.length}`)

    if (criadores.length === 0) {
      console.log('ℹ️ Nenhum criador encontrado para promoção')
      return res.status(200).json({ 
        success: true, 
        message: 'Nenhum criador encontrado',
        timestamp: new Date().toISOString()
      })
    }

    // Calcular pontuação para cada criador
    const criadoresComPontuacao = await Promise.all(criadores.map(async c => {
      try {
        const sementesRecebidas = c.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
        const pontosUsuario = c.usuario.pontuacao || 0
        
        const [conteudos, enquetes, recadosPublicos] = await Promise.all([
          prisma.conteudo.aggregate({
            where: { criadorId: c.id },
            _sum: { visualizacoes: true }
          }).catch(() => ({ _sum: { visualizacoes: 0 } })),
          
          prisma.enquete.count({
            where: { criadorId: c.usuarioId }
          }).catch(() => 0),
          
          prisma.recado.count({
            where: { 
              destinatarioId: c.usuarioId,
              publico: true 
            }
          }).catch(() => 0)
        ])
        
        const pontosVisualizacoes = Math.floor((conteudos._sum.visualizacoes || 0) * 0.1)
        const pontosEnquetes = enquetes * 5
        const pontosRecadosPublicos = recadosPublicos * 2
        
        const pontuacaoTotal = sementesRecebidas + pontosUsuario + pontosVisualizacoes + pontosEnquetes + pontosRecadosPublicos
        
        return {
          id: c.id,
          usuarioId: c.usuarioId,
          nome: c.usuario.nome,
          nivelAtual: c.usuario.nivel,
          pontuacaoTotal
        }
      } catch (error) {
        console.error(`Erro ao calcular pontuação do criador ${c.id}:`, error)
        return {
          id: c.id,
          usuarioId: c.usuarioId,
          nome: c.usuario.nome,
          nivelAtual: c.usuario.nivel,
          pontuacaoTotal: 0
        }
      }
    }))

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    // Aplicar promoções
    const promocoes = []
    const rebaixamentos = []
    const semMudancas = []

    for (let i = 0; i < criadoresComPontuacao.length; i++) {
      const criador = criadoresComPontuacao[i]
      const posicao = i + 1
      const novoNivel = determinarNovoNivel(posicao, criadoresComPontuacao.length)
      
      if (novoNivel !== criador.nivelAtual) {
        try {
          // Atualizar nível do usuário
          await prisma.usuario.update({
            where: { id: criador.usuarioId },
            data: { nivel: novoNivel }
          })

          if (novoNivel > criador.nivelAtual) {
            promocoes.push({
              nome: criador.nome,
              nivelAnterior: criador.nivelAtual,
              novoNivel: novoNivel,
              posicao: posicao,
              pontuacao: criador.pontuacaoTotal
            })
            console.log(`🚀 PROMOVIDO: ${criador.nome} ${criador.nivelAtual} → ${novoNivel} (${posicao}º lugar)`)
          } else {
            rebaixamentos.push({
              nome: criador.nome,
              nivelAnterior: criador.nivelAtual,
              novoNivel: novoNivel,
              posicao: posicao,
              pontuacao: criador.pontuacaoTotal
            })
            console.log(`📉 REBAIXADO: ${criador.nome} ${criador.nivelAtual} → ${novoNivel} (${posicao}º lugar)`)
          }
        } catch (error) {
          console.error(`❌ Erro ao atualizar ${criador.nome}:`, error)
        }
      } else {
        semMudancas.push({
          nome: criador.nome,
          nivel: criador.nivelAtual,
          posicao: posicao,
          pontuacao: criador.pontuacaoTotal
        })
      }
    }

    // Log do resumo
    console.log('\n🏆 RESUMO DAS PROMOÇÕES AUTOMÁTICAS:')
    console.log(`📈 Promoções: ${promocoes.length}`)
    console.log(`📉 Rebaixamentos: ${rebaixamentos.length}`)
    console.log(`✅ Sem mudanças: ${semMudancas.length}`)
    console.log(`📊 Total processado: ${criadoresComPontuacao.length}`)

    // Log das promoções (sem salvar no banco por enquanto)
    if (promocoes.length > 0 || rebaixamentos.length > 0) {
      console.log('📝 Log das promoções disponível para implementação futura')
    }

    res.status(200).json({
      success: true,
      message: 'Promoções automáticas executadas com sucesso',
      timestamp: new Date().toISOString(),
      resumo: {
        totalCriadores: criadoresComPontuacao.length,
        promocoes: promocoes.length,
        rebaixamentos: rebaixamentos.length,
        semMudancas: semMudancas.length
      },
      promocoes,
      rebaixamentos
    })

  } catch (error) {
    console.error('❌ Erro no cron job de promoção:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    })
  }
}

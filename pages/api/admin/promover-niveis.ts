import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

// Função para determinar novo nível baseado na posição
function determinarNovoNivel(posicao: number, totalCriadores: number): string {
  if (totalCriadores === 1) return 'criador-supremo'
  if (posicao <= 50) return 'criador-supremo' // Top 1-50
  if (posicao <= 100) return 'criador-parceiro' // Top 51-100
  if (posicao <= 150) return 'criador-comum' // Top 101-150
  return 'criador-iniciante' // Top 151+
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('🚀 INICIANDO PROMOÇÃO AUTOMÁTICA DE NÍVEIS...')

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
          } else {
            rebaixamentos.push({
              nome: criador.nome,
              nivelAnterior: criador.nivelAtual,
              novoNivel: novoNivel,
              posicao: posicao,
              pontuacao: criador.pontuacaoTotal
            })
          }

          console.log(`✅ ${criador.nome}: ${criador.nivelAtual} → ${novoNivel} (${posicao}º lugar)`)
        } catch (error) {
          console.error(`❌ Erro ao atualizar ${criador.nome}:`, error)
        }
      }
    }

    // Buscar ranking atualizado
    const rankingAtualizado = await prisma.usuario.findMany({
      where: {
        nivel: {
          in: ['criador-supremo', 'criador-parceiro', 'criador-comum', 'criador-iniciante']
        }
      },
      select: {
        id: true,
        nome: true,
        nivel: true
      },
      orderBy: {
        nivel: 'asc'
      }
    })

    console.log('\n🏆 PROMOÇÕES APLICADAS COM SUCESSO!')
    console.log(`📈 Total de promoções: ${promocoes.length}`)
    console.log(`📉 Total de rebaixamentos: ${rebaixamentos.length}`)

    res.status(200).json({
      success: true,
      message: 'Promoções aplicadas com sucesso',
      promocoes,
      rebaixamentos,
      rankingAtualizado,
      totalCriadores: criadoresComPontuacao.length
    })

  } catch (error) {
    console.error('❌ Erro ao promover níveis:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}

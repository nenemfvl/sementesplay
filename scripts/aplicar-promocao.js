const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function aplicarPromocao() {
  try {
    console.log('🚀 APLICANDO PROMOÇÃO AUTOMÁTICA DE NÍVEIS...\n')
    
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

    console.log(`📊 Total de criadores encontrados: ${criadores.length}\n`)

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

    // Função para determinar novo nível baseado na posição
    function determinarNovoNivel(posicao, totalCriadores) {
      if (totalCriadores === 1) return 'criador-supremo'
      if (posicao === 1) return 'criador-supremo'
      if (posicao <= Math.ceil(totalCriadores * 0.1)) return 'criador-supremo' // Top 10%
      if (posicao <= Math.ceil(totalCriadores * 0.3)) return 'criador-parceiro' // Top 30%
      if (posicao <= Math.ceil(totalCriadores * 0.6)) return 'criador-comum' // Top 60%
      return 'criador-iniciante'
    }

    // Aplicar promoções
    const promocoes = []
    const rebaixamentos = []

    console.log('🔄 APLICANDO MUDANÇAS DE NÍVEL...\n')

    for (let i = 0; i < criadoresComPontuacao.length; i++) {
      const criador = criadoresComPontuacao[i]
      const posicao = i + 1
      const novoNivel = determinarNovoNivel(posicao, criadoresComPontuacao.length)
      
      if (novoNivel !== criador.nivelAtual) {
        try {
          console.log(`🔄 Atualizando ${criador.nome}: ${criador.nivelAtual} → ${novoNivel} (${posicao}º lugar)`)
          
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
            console.log(`✅ PROMOVIDO: ${criador.nome} agora é ${novoNivel}!`)
          } else {
            rebaixamentos.push({
              nome: criador.nome,
              nivelAnterior: criador.nivelAtual,
              novoNivel: novoNivel,
              posicao: posicao,
              pontuacao: criador.pontuacaoTotal
            })
            console.log(`📉 REBAIXADO: ${criador.nome} agora é ${novoNivel}`)
          }
        } catch (error) {
          console.error(`❌ Erro ao atualizar ${criador.nome}:`, error)
        }
      } else {
        console.log(`✅ ${criador.nome} mantém o nível ${criador.nivelAtual} (${posicao}º lugar)`)
      }
    }

    // Verificar resultado final
    console.log('\n🏆 VERIFICANDO RESULTADO FINAL...\n')
    
    const usuariosAtualizados = await prisma.usuario.findMany({
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

    console.log('📊 NÍVEIS ATUALIZADOS:')
    usuariosAtualizados.forEach(usuario => {
      console.log(`- ${usuario.nome}: ${usuario.nivel}`)
    })

    console.log('\n🎯 RESUMO FINAL:')
    console.log(`🚀 Promoções aplicadas: ${promocoes.length}`)
    console.log(`📉 Rebaixamentos aplicados: ${rebaixamentos.length}`)
    console.log(`📊 Total de criadores: ${criadoresComPontuacao.length}`)

    if (promocoes.length > 0) {
      console.log('\n🎉 PARABÉNS AOS PROMOVIDOS:')
      promocoes.forEach(promocao => {
        console.log(`🏆 ${promocao.nome}: ${promocao.nivelAnterior} → ${promocao.novoNivel} (${promocao.posicao}º lugar)`)
      })
    }

  } catch (error) {
    console.error('❌ Erro ao aplicar promoção:', error)
  } finally {
    await prisma.$disconnect()
  }
}

aplicarPromocao()

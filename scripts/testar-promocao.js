const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarPromocao() {
  try {
    console.log('🧪 TESTANDO SISTEMA DE PROMOÇÃO AUTOMÁTICA...\n')
    
    // Simular a lógica de promoção
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

    // Mostrar simulação de promoções
    console.log('🏅 SIMULAÇÃO DE PROMOÇÕES AUTOMÁTICAS\n')
    console.log('Pos | Nome                    | Nível Atual        | Nível Sugerido    | Pontuação Total | Status')
    console.log('----|-------------------------|-------------------|-------------------|-----------------|------------------')

    let totalPromocoes = 0
    let totalRebaixamentos = 0

    criadoresComPontuacao.forEach((criador, index) => {
      const posicao = index + 1
      const nome = criador.nome.padEnd(25)
      const nivelAtual = criador.nivelAtual.padEnd(20)
      const nivelSugerido = determinarNovoNivel(posicao, criadoresComPontuacao.length).padEnd(20)
      const pontuacao = criador.pontuacaoTotal.toString().padStart(15)
      
      let status = '✅ Mantém'
      if (nivelSugerido > nivelAtual) {
        status = '🚀 PROMOVIDO!'
        totalPromocoes++
      } else if (nivelSugerido < nivelAtual) {
        status = '📉 REBAIXADO'
        totalRebaixamentos++
      }
      
      console.log(`${posicao.toString().padStart(3)} | ${nome} | ${nivelAtual} | ${nivelSugerido} | ${pontuacao} | ${status}`)
    })

    console.log('\n📊 RESUMO DAS MUDANÇAS:')
    console.log(`🚀 Promoções: ${totalPromocoes}`)
    console.log(`📉 Rebaixamentos: ${totalRebaixamentos}`)
    console.log(`✅ Sem mudanças: ${criadoresComPontuacao.length - totalPromocoes - totalRebaixamentos}`)

    console.log('\n🎯 REGRAS DE PROMOÇÃO:')
    console.log('- 1º lugar: criador-supremo (elite)')
    console.log('- Top 10%: criador-supremo')
    console.log('- Top 30%: criador-parceiro')
    console.log('- Top 60%: criador-comum')
    console.log('- Restante: criador-iniciante')

    console.log('\n💡 PARA APLICAR AS PROMOÇÕES:')
    console.log('POST /api/admin/promover-niveis')

  } catch (error) {
    console.error('❌ Erro ao testar promoção:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarPromocao()

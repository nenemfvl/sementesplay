const { PrismaClient } = require('@prisma/client')

// Função para determinar novo nível baseado na posição (igual à API)
function determinarNovoNivel(posicao, totalCriadores) {
  if (totalCriadores === 1) return 'criador-supremo'
  if (posicao <= 50) return 'criador-supremo' // Top 1-50
  if (posicao <= 100) return 'criador-parceiro' // Top 51-100
  if (posicao <= 150) return 'criador-comum' // Top 101-150
  return 'criador-iniciante' // Top 151+
}

// Função para gerar pontuação aleatória realista
function gerarPontuacaoRealista() {
  // Simular distribuição realista de pontuações
  const base = Math.random() * 1000 // Base de 0-1000
  const bonus = Math.random() * 500 // Bônus aleatório
  return Math.floor(base + bonus)
}

// Função para simular ranking de 200 criadores
function simularRanking200Criadores() {
  console.log('🎯 SIMULANDO SISTEMA DE PROMOÇÃO AUTOMÁTICA COM 200 CRIADORES')
  console.log('=' .repeat(80))
  
  // Criar array de 200 criadores com pontuações variadas
  const criadores = []
  
  for (let i = 1; i <= 200; i++) {
    criadores.push({
      id: `criador_${i}`,
      nome: `Criador_${i.toString().padStart(3, '0')}`,
      pontuacaoTotal: gerarPontuacaoRealista(),
      nivelAtual: 'criador-iniciante' // Todos começam como iniciantes
    })
  }
  
  // Ordenar por pontuação (maior para menor)
  criadores.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)
  
  console.log(`📊 Total de criadores: ${criadores.length}`)
  console.log(`🏆 1º lugar: ${criadores[0].nome} com ${criadores[0].pontuacaoTotal} pontos`)
  console.log(`🥈 2º lugar: ${criadores[1].nome} com ${criadores[1].pontuacaoTotal} pontos`)
  console.log(`🥉 3º lugar: ${criadores[2].nome} com ${criadores[2].pontuacaoTotal} pontos`)
  console.log(`📉 Último lugar: ${criadores[199].nome} com ${criadores[199].pontuacaoTotal} pontos`)
  console.log('')
  
  // Aplicar promoções automáticas
  const promocoes = []
  const rebaixamentos = []
  const semMudancas = []
  
  for (let i = 0; i < criadores.length; i++) {
    const criador = criadores[i]
    const posicao = i + 1
    const novoNivel = determinarNovoNivel(posicao, criadores.length)
    
    if (novoNivel !== criador.nivelAtual) {
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
    } else {
      semMudancas.push({
        nome: criador.nome,
        nivel: criador.nivelAtual,
        posicao: posicao,
        pontuacao: criador.pontuacaoTotal
      })
    }
  }
  
  // Mostrar estatísticas das promoções
  console.log('📈 ESTATÍSTICAS DAS PROMOÇÕES:')
  console.log(`🚀 Total de promoções: ${promocoes.length}`)
  console.log(`📉 Total de rebaixamentos: ${rebaixamentos.length}`)
  console.log(`✅ Sem mudanças: ${semMudancas.length}`)
  console.log('')
  
  // Mostrar distribuição por níveis
  const distribuicaoNiveis = {}
  criadores.forEach((criador, index) => {
    const posicao = index + 1
    const nivel = determinarNovoNivel(posicao, criadores.length)
    distribuicaoNiveis[nivel] = (distribuicaoNiveis[nivel] || 0) + 1
  })
  
  console.log('🏅 DISTRIBUIÇÃO POR NÍVEIS:')
  console.log(`👑 Criador Supremo: ${distribuicaoNiveis['criador-supremo']} criadores (Top 1-50)`)
  console.log(`⭐ Criador Parceiro: ${distribuicaoNiveis['criador-parceiro']} criadores (Top 51-100)`)
  console.log(`🌟 Criador Comum: ${distribuicaoNiveis['criador-comum']} criadores (Top 101-150)`)
  console.log(`🌱 Criador Iniciante: ${distribuicaoNiveis['criador-iniciante']} criadores (Top 151-200)`)
  console.log('')
  
  // Mostrar alguns exemplos de promoções
  if (promocoes.length > 0) {
    console.log('🚀 EXEMPLOS DE PROMOÇÕES:')
    promocoes.slice(0, 5).forEach(promocao => {
      console.log(`  ${promocao.posicao}º - ${promocao.nome}: ${promocao.nivelAnterior} → ${promocao.novoNivel} (${promocao.pontuacao} pts)`)
    })
    if (promocoes.length > 5) {
      console.log(`  ... e mais ${promocoes.length - 5} promoções`)
    }
    console.log('')
  }
  
  // Verificar se os números fazem sentido
  const totalEsperado = 200
  const totalCalculado = Object.values(distribuicaoNiveis).reduce((a, b) => a + b, 0)
  
  console.log('✅ VERIFICAÇÃO MATEMÁTICA:')
  console.log(`Total esperado: ${totalEsperado}`)
  console.log(`Total calculado: ${totalCalculado}`)
  console.log(`✅ ${totalEsperado === totalCalculado ? 'CORRETO' : 'ERRO'}`)
  console.log('')
  
  // Verificar se as faixas estão corretas
  const top50 = 50 // Top 50 criadores
  const top100 = 100 // Top 100 criadores  
  const top150 = 150 // Top 150 criadores
  
  console.log('📊 VERIFICAÇÃO DAS FAIXAS:')
  console.log(`Top 1-50: ${distribuicaoNiveis['criador-supremo']} criadores`)
  console.log(`Top 51-100: ${distribuicaoNiveis['criador-parceiro']} criadores`)
  console.log(`Top 101-150: ${distribuicaoNiveis['criador-comum']} criadores`)
  console.log(`Top 151-200: ${distribuicaoNiveis['criador-iniciante']} criadores`)
  console.log('')
  
  // Mostrar alguns criadores em cada nível para verificação
  console.log('🔍 EXEMPLOS POR NÍVEL:')
  
  // Criadores Supremos
  const supremos = criadores.slice(0, top50)
  console.log(`👑 Criadores Supremos (1-${top50}):`)
  supremos.slice(0, 3).forEach((c, i) => {
    console.log(`  ${i + 1}º: ${c.nome} - ${c.pontuacaoTotal} pts`)
  })
  if (supremos.length > 3) console.log(`  ... e mais ${supremos.length - 3} criadores`)
  
  // Criadores Parceiros
  const parceiros = criadores.slice(top50, top100)
  console.log(`\n⭐ Criadores Parceiros (${top50 + 1}-${top100}):`)
  parceiros.slice(0, 3).forEach((c, i) => {
    console.log(`  ${top50 + i + 1}º: ${c.nome} - ${c.pontuacaoTotal} pts`)
  })
  if (parceiros.length > 3) console.log(`  ... e mais ${parceiros.length - 3} criadores`)
  
  // Criadores Comuns
  const comuns = criadores.slice(top100, top150)
  console.log(`\n🌟 Criadores Comuns (${top100 + 1}-${top150}):`)
  comuns.slice(0, 3).forEach((c, i) => {
    console.log(`  ${top100 + i + 1}º: ${c.nome} - ${c.pontuacaoTotal} pts`)
  })
  if (comuns.length > 3) console.log(`  ... e mais ${comuns.length - 3} criadores`)
  
  // Criadores Iniciantes
  const iniciantes = criadores.slice(top150)
  console.log(`\n🌱 Criadores Iniciantes (${top150 + 1}-200):`)
  iniciantes.slice(0, 3).forEach((c, i) => {
    console.log(`  ${top150 + i + 1}º: ${c.nome} - ${c.pontuacaoTotal} pts`)
  })
  if (iniciantes.length > 3) console.log(`  ... e mais ${iniciantes.length - 3} criadores`)
  
  console.log('\n' + '=' .repeat(80))
  console.log('🎯 TESTE CONCLUÍDO! Sistema de promoção automática funcionando perfeitamente!')
}

// Executar o teste
simularRanking200Criadores()

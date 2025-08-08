// Cálculo de ciclos por season

console.log('📊 Calculando ciclos por season...\n')

// Duração de cada período
const diasPorCiclo = 15
const diasPorSeason = 3 * 30 // 3 meses = aproximadamente 90 dias

console.log(`🔄 Duração do ciclo: ${diasPorCiclo} dias`)
console.log(`🏆 Duração da season: ${diasPorSeason} dias (3 meses)\n`)

// Cálculo
const ciclosPorSeason = Math.floor(diasPorSeason / diasPorCiclo)
const diasRestantes = diasPorSeason % diasPorCiclo

console.log(`🎯 Resultado:`)
console.log(`   - ${ciclosPorSeason} ciclos completos por season`)
console.log(`   - ${diasRestantes} dias restantes\n`)

console.log(`📈 Cronograma da Season 1:`)
for (let i = 1; i <= ciclosPorSeason; i++) {
  const inicioEmDias = (i - 1) * diasPorCiclo
  const fimEmDias = i * diasPorCiclo - 1
  console.log(`   Ciclo #${i}: Dia ${inicioEmDias + 1} ao ${fimEmDias + 1}`)
}

if (diasRestantes > 0) {
  const ultimoDia = ciclosPorSeason * diasPorCiclo
  console.log(`   Dias finais: Dia ${ultimoDia + 1} ao ${diasPorSeason} (${diasRestantes} dias)`)
}

console.log(`\n🚀 A Season 2 começará após ${diasPorSeason} dias (3 meses) do início da Season 1`)
console.log(`⚡ Quando a season resetar, também volta para o Ciclo #1`)

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarXPMissoes() {
  try {
    console.log('🔍 Verificando XP das missões...')
    
    // Buscar todas as missões
    const missoes = await prisma.missao.findMany({
      where: {
        ativa: true
      },
      select: {
        id: true,
        titulo: true,
        tipo: true,
        objetivo: true,
        recompensa: true,
        emblema: true
      }
    })
    
    console.log(`\n📋 Encontradas ${missoes.length} missões ativas:`)
    
    for (const missao of missoes) {
      console.log(`\n🎯 ${missao.titulo}`)
      console.log(`   ID: ${missao.id}`)
      console.log(`   Tipo: ${missao.tipo}`)
      console.log(`   Objetivo: ${missao.objetivo}`)
      console.log(`   Recompensa (XP): ${missao.recompensa}`)
      console.log(`   Emblema: ${missao.emblema}`)
    }
    
    // Verificar missões relacionadas a doações especificamente
    console.log('\n💸 Missões relacionadas a doações:')
    const missoesDoacao = missoes.filter(m => 
      m.titulo.includes('Doação') || 
      m.titulo.includes('Doador')
    )
    
    for (const missao of missoesDoacao) {
      console.log(`\n   🎯 ${missao.titulo}`)
      console.log(`      XP: ${missao.recompensa}`)
      console.log(`      Objetivo: ${missao.objetivo}`)
    }
    
    // Verificar se há valores de XP inconsistentes
    console.log('\n⚠️  Verificando inconsistências:')
    const missoesSemXP = missoes.filter(m => !m.recompensa || m.recompensa === 0)
    if (missoesSemXP.length > 0) {
      console.log(`   Missões sem XP: ${missoesSemXP.length}`)
      for (const missao of missoesSemXP) {
        console.log(`      - ${missao.titulo}`)
      }
    } else {
      console.log('   ✅ Todas as missões têm XP definido')
    }
    
    // Verificar valores de XP muito altos ou baixos
    const missoesXPAlto = missoes.filter(m => m.recompensa > 100)
    const missoesXPBaixo = missoes.filter(m => m.recompensa < 10)
    
    if (missoesXPAlto.length > 0) {
      console.log(`\n   ⚠️  Missões com XP alto (>100): ${missoesXPAlto.length}`)
      for (const missao of missoesXPAlto) {
        console.log(`      - ${missao.titulo}: ${missao.recompensa} XP`)
      }
    }
    
    if (missoesXPBaixo.length > 0) {
      console.log(`\n   ⚠️  Missões com XP baixo (<10): ${missoesXPBaixo.length}`)
      for (const missao of missoesXPBaixo) {
        console.log(`      - ${missao.titulo}: ${missao.recompensa} XP`)
      }
    }
    
    // Estatísticas gerais
    const totalXP = missoes.reduce((sum, m) => sum + (m.recompensa || 0), 0)
    const mediaXP = totalXP / missoes.length
    
    console.log('\n📊 Estatísticas:')
    console.log(`   Total de missões: ${missoes.length}`)
    console.log(`   Total de XP disponível: ${totalXP}`)
    console.log(`   Média de XP por missão: ${mediaXP.toFixed(1)}`)
    console.log(`   XP mínimo: ${Math.min(...missoes.map(m => m.recompensa || 0))}`)
    console.log(`   XP máximo: ${Math.max(...missoes.map(m => m.recompensa || 0))}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarXPMissoes() 
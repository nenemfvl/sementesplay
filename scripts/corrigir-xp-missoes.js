const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function corrigirXPMissoes() {
  try {
    console.log('🔧 Corrigindo XP das missões...')
    
    // Definir valores de XP para as missões que estão com 0
    const correcoes = [
      {
        titulo: 'Doador Frequente',
        xp: 150,
        descricao: 'Missão de doação frequente - XP moderado'
      },
      {
        titulo: 'Primeira Doação',
        xp: 50,
        descricao: 'Primeira doação do usuário - XP inicial'
      },
      {
        titulo: 'Doador Generoso',
        xp: 500,
        descricao: 'Missão de doação generosa - XP alto'
      },
      {
        titulo: 'Apoiador de Criadores',
        xp: 200,
        descricao: 'Apoio a criadores - XP moderado'
      }
    ]
    
    console.log(`\n📝 Aplicando ${correcoes.length} correções:`)
    
    for (const correcao of correcoes) {
      console.log(`\n🎯 ${correcao.titulo}`)
      console.log(`   XP atual: 0 → ${correcao.xp}`)
      console.log(`   Descrição: ${correcao.descricao}`)
      
      // Atualizar a missão
      const resultado = await prisma.missao.updateMany({
        where: {
          titulo: correcao.titulo
        },
        data: {
          recompensa: correcao.xp
        }
      })
      
      console.log(`   ✅ Atualizada: ${resultado.count} registro(s)`)
    }
    
    // Verificar se as correções foram aplicadas
    console.log('\n🔍 Verificando correções aplicadas:')
    const missoesCorrigidas = await prisma.missao.findMany({
      where: {
        titulo: {
          in: correcoes.map(c => c.titulo)
        }
      },
      select: {
        titulo: true,
        recompensa: true
      }
    })
    
    for (const missao of missoesCorrigidas) {
      console.log(`   ${missao.titulo}: ${missao.recompensa} XP`)
    }
    
    // Verificar se ainda há missões com XP = 0
    const missoesSemXP = await prisma.missao.findMany({
      where: {
        ativa: true,
        recompensa: 0
      },
      select: {
        titulo: true,
        tipo: true
      }
    })
    
    if (missoesSemXP.length > 0) {
      console.log(`\n⚠️  Ainda há ${missoesSemXP.length} missões com XP = 0:`)
      for (const missao of missoesSemXP) {
        console.log(`   - ${missao.titulo} (${missao.tipo})`)
      }
    } else {
      console.log('\n✅ Todas as missões agora têm XP definido!')
    }
    
    console.log('\n🎉 Correção concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

corrigirXPMissoes() 
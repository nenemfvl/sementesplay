const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function zerarPontosVelinha() {
  try {
    console.log('🎯 Zerando pontos do usuário velinha...\n')

    // 1. Verificar usuário antes
    console.log('1️⃣ Estado ANTES da alteração:')
    
    const usuarioAntes = await prisma.usuario.findFirst({
      where: {
        nome: 'velinha'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        sementes: true,
        pontuacao: true
      }
    })

    if (!usuarioAntes) {
      console.log('   ❌ Usuário "velinha" não encontrado!')
      return
    }

    console.log(`   👤 ${usuarioAntes.nome} (${usuarioAntes.nivel}):`)
    console.log(`      💰 Sementes: ${usuarioAntes.sementes}`)
    console.log(`      🏆 Pontuação: ${usuarioAntes.pontuacao}`)
    console.log()

    // 2. Zerar pontos
    console.log('2️⃣ Zerando pontuação...')
    
    await prisma.usuario.update({
      where: {
        id: usuarioAntes.id
      },
      data: {
        pontuacao: 0
      }
    })

    console.log('   ✅ Pontuação zerada com sucesso!')
    console.log()

    // 3. Verificar resultado
    console.log('3️⃣ Estado APÓS a alteração:')
    
    const usuarioDepois = await prisma.usuario.findFirst({
      where: {
        nome: 'velinha'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        sementes: true,
        pontuacao: true
      }
    })

    console.log(`   👤 ${usuarioDepois.nome} (${usuarioDepois.nivel}):`)
    console.log(`      💰 Sementes: ${usuarioDepois.sementes} (MANTIDAS)`)
    console.log(`      🏆 Pontuação: ${usuarioDepois.pontuacao} (ZERADA)`)
    console.log()

    // 4. Resumo da alteração
    console.log('4️⃣ RESUMO:')
    console.log(`   🔄 Pontuação alterada: ${usuarioAntes.pontuacao} → ${usuarioDepois.pontuacao}`)
    console.log(`   💰 Sementes mantidas: ${usuarioAntes.sementes} → ${usuarioDepois.sementes}`)
    console.log(`   ✅ Operação concluída com sucesso!`)

  } catch (error) {
    console.error('❌ Erro ao zerar pontos do usuário velinha:', error)
  } finally {
    await prisma.$disconnect()
  }
}

zerarPontosVelinha()

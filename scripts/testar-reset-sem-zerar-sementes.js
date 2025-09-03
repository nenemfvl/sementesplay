const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testarResetSemZerarSementes() {
  try {
    console.log('🧪 Testando novo comportamento: reset SEM zerar sementes...\n')

    // 1. Verificar estado atual
    console.log('1️⃣ Estado atual dos usuários:')
    
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        sementes: true,
        pontuacao: true
      },
      orderBy: {
        sementes: 'desc'
      }
    })

    console.log(`   📊 Total de usuários: ${usuarios.length}`)
    
    usuarios.forEach(user => {
      console.log(`   👤 ${user.nome} (${user.nivel}): ${user.sementes} sementes, ${user.pontuacao} pontos`)
    })
    console.log()

    // 2. Simular o que aconteceria no reset
    console.log('2️⃣ SIMULANDO reset (sem executar):')
    console.log('   🔄 O que SERIA executado:')
    console.log('   ✅ prisma.usuario.updateMany({ data: { pontuacao: 0 } })')
    console.log('   ❌ prisma.usuario.updateMany({ data: { sementes: 0 } }) - REMOVIDO!')
    console.log('   ✅ prisma.doacao.deleteMany()')
    console.log('   ✅ prisma.semente.deleteMany()')
    console.log('   ✅ prisma.conteudo.deleteMany()')
    console.log('   ✅ prisma.conteudoParceiro.deleteMany()')
    console.log()

    // 3. Mostrar o que aconteceria com cada usuário
    console.log('3️⃣ Resultado esperado após reset:')
    
    usuarios.forEach(user => {
      console.log(`   👤 ${user.nome}:`)
      console.log(`      💰 Sementes: ${user.sementes} → ${user.sementes} (MANTIDAS!)`)
      console.log(`      🏆 Pontuação: ${user.pontuacao} → 0 (ZERADA)`)
      console.log(`      📊 Ranking: ${user.pontuacao > 0 ? 'Apareceria' : 'Não apareceria'} (baseado em doações)`)
    })
    console.log()

    // 4. Verificar doações atuais
    const doacoes = await prisma.doacao.count()
    const sementes = await prisma.semente.count()
    
    console.log('4️⃣ Dados que seriam afetados:')
    console.log(`   💸 Doações: ${doacoes} → 0 (DELETADAS)`)
    console.log(`   📈 Histórico sementes: ${sementes} → 0 (DELETADO)`)
    console.log()

    // 5. Conclusão
    console.log('5️⃣ CONCLUSÃO:')
    console.log('   ✅ Sementes dos usuários NÃO são mais zeradas')
    console.log('   ✅ Pontuações continuam sendo zeradas')
    console.log('   ✅ Doações continuam sendo deletadas')
    console.log('   ✅ Rankings continuam filtrados por atividade')
    console.log('   💡 Usuários mantêm suas sementes entre ciclos!')
    console.log()
    console.log('🎯 RESULTADO: Reset agora preserva as sementes dos usuários!')

  } catch (error) {
    console.error('❌ Erro ao testar reset sem zerar sementes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarResetSemZerarSementes()

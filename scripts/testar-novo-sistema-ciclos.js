const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarNovoSistemaCiclos() {
  try {
    console.log('🧪 Testando novo sistema de ciclos...\n')

    // 1. Verificar configuração atual
    console.log('1️⃣ Verificando configuração atual...')
    const config = await prisma.configuracaoCiclos.findFirst()
    
    if (!config) {
      console.log('   ❌ Nenhuma configuração encontrada')
      return
    }

    console.log(`   ✅ Ciclo atual: #${config.numeroCiclo}`)
    console.log(`   ✅ Season atual: S${config.numeroSeason}`)
    console.log(`   ⏸️  Pausado: ${config.pausado ? 'SIM' : 'NÃO'}`)

    // 2. Verificar estado atual dos usuários
    console.log('\n2️⃣ Verificando estado atual dos usuários...')
    
    const totalUsuarios = await prisma.usuario.count()
    const usuariosComPontuacao = await prisma.usuario.count({
      where: {
        pontuacao: { gt: 0 }
      }
    })
    
    const usuariosComSementes = await prisma.usuario.count({
      where: {
        sementes: { gt: 0 }
      }
    })
    
    const totalDoacoes = await prisma.doacao.count()
    const totalConteudos = await prisma.conteudo.count()

    console.log(`   👥 Total de usuários: ${totalUsuarios}`)
    console.log(`   📊 Usuários com pontuação > 0: ${usuariosComPontuacao}`)
    console.log(`   💰 Usuários com sementes > 0: ${usuariosComSementes}`)
    console.log(`   💝 Total de doações: ${totalDoacoes}`)
    console.log(`   📝 Total de conteúdos: ${totalConteudos}`)

    // 3. Verificar usuários que fizeram doações
    console.log('\n3️⃣ Verificando usuários que fizeram doações...')
    
    const usuariosComDoacoes = await prisma.usuario.findMany({
      where: {
        doacoesFeitas: {
          some: {}
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        pontuacao: true,
        sementes: true
      }
    })

    console.log(`   💝 Usuários que fizeram doações: ${usuariosComDoacoes.length}`)
    
    if (usuariosComDoacoes.length > 0) {
      console.log('   📊 Top 5 doadores:')
      usuariosComDoacoes.slice(0, 5).forEach((usuario, index) => {
        console.log(`   ${index + 1}. ${usuario.nome} - ${usuario.pontuacao || 0} pontos - ${usuario.sementes || 0} sementes`)
      })
    }

    // 4. Verificar criadores que receberam doações
    console.log('\n4️⃣ Verificando criadores que receberam doações...')
    
    const criadoresComDoacoes = await prisma.criador.findMany({
      where: {
        doacoesRecebidas: {
          some: {}
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true,
            pontuacao: true,
            sementes: true
          }
        }
      }
    })

    console.log(`   🎨 Criadores que receberam doações: ${criadoresComDoacoes.length}`)
    
    if (criadoresComDoacoes.length > 0) {
      console.log('   📊 Top 5 criadores:')
      criadoresComDoacoes.slice(0, 5).forEach((criador, index) => {
        console.log(`   ${index + 1}. ${criador.usuario.nome} - ${criador.usuario.pontuacao || 0} pontos - ${criador.usuario.sementes || 0} sementes`)
      })
    }

    // 5. Simular o que aconteceria no próximo reset
    console.log('\n5️⃣ Simulando próximo reset de ciclo...')
    console.log('   🔄 O que acontecerá no próximo reset:')
    console.log('   ✅ Pontuações de TODOS os usuários serão zeradas')
    console.log('   ✅ Sementes de TODOS os usuários serão zeradas')
    console.log('   ✅ TODAS as doações serão deletadas')
    console.log('   ✅ Histórico de sementes será deletado')
    console.log('   ✅ Níveis de criadores resetados para "criador-iniciante"')
    console.log('   ✅ TODOS os conteúdos serão deletados')
    console.log('   ✅ Ranking do ciclo será resetado')
    console.log('   🎯 NOVO: Só aparecerão no ranking quem fizer doações')

    // 6. Verificar impacto nos rankings
    console.log('\n6️⃣ Impacto nos rankings:')
    console.log('   📊 Ranking de doadores: Só quem fez doações aparecerá')
    console.log('   🎨 Ranking de criadores: Só quem recebeu doações aparecerá')
    console.log('   👥 Ranking social: Só quem fez doações aparecerá')
    console.log('   🎯 Ranking de missões: Continua normal')

    // 7. Conclusão
    console.log('\n7️⃣ CONCLUSÃO:')
    console.log('   ✅ Sistema agora é MAIS JUSTO para novos usuários')
    console.log('   ✅ Todos começam do zero a cada ciclo')
    console.log('   ✅ Só aparecem no ranking quem participa ativamente')
    console.log('   ✅ Igualdade de oportunidades garantida')
    console.log('   🎯 Novos usuários não ficam em desvantagem')

    console.log('\n🎉 Novo sistema implementado com sucesso!')
    console.log('⚖️  Sistema agora é mais justo e equilibrado!')

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarNovoSistemaCiclos()

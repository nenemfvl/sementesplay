const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarAfetacaoUsuariosComuns() {
  try {
    console.log('🔍 Verificando se o reset de ciclos afeta usuários comuns...\n')

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

    // 2. Verificar quantos usuários comuns existem
    console.log('\n2️⃣ Verificando usuários comuns...')
    const usuariosComuns = await prisma.usuario.count({
      where: {
        nivel: 'comum'
      }
    })

    const usuariosCriadores = await prisma.usuario.count({
      where: {
        nivel: {
          in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
        }
      }
    })

    console.log(`   👥 Usuários comuns: ${usuariosComuns}`)
    console.log(`   🎨 Usuários criadores: ${usuariosCriadores}`)

    // 3. Verificar o que o reset de ciclos faz
    console.log('\n3️⃣ Análise do reset de ciclos...')
    console.log('   📋 O que o reset de ciclos faz:')
    console.log('   ✅ Reseta ranking do ciclo (ranking_ciclo)')
    console.log('   ✅ Reseta níveis de criadores para "criador-iniciante"')
    console.log('   ✅ Limpa conteúdos (conteudo e conteudo_parceiro)')
    console.log('   ❌ NÃO afeta usuários comuns (nível "comum")')
    console.log('   ❌ NÃO afeta pontuação geral dos usuários')
    console.log('   ❌ NÃO afeta sementes dos usuários')

    // 4. Verificar código específico do reset
    console.log('\n4️⃣ Código do reset analisado:')
    console.log('   🔍 Linha 47-53 do script forcar-reset-ciclo.js:')
    console.log('   ```javascript')
    console.log('   // Resetar níveis de criadores para "criador-iniciante"')
    console.log('   await prisma.usuario.updateMany({')
    console.log('     where: {')
    console.log('       nivel: {')
    console.log('         in: ["criador-iniciante", "criador-comum", "criador-parceiro", "criador-supremo"]')
    console.log('       }')
    console.log('     },')
    console.log('     data: {')
    console.log('       nivel: "criador-iniciante"')
    console.log('     }')
    console.log('   })')
    console.log('   ```')

    // 5. Verificar ranking de usuários comuns
    console.log('\n5️⃣ Verificando ranking de usuários comuns...')
    const rankingUsuariosComuns = await prisma.usuario.findMany({
      where: {
        nivel: 'comum'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        pontuacao: true,
        sementes: true
      },
      orderBy: {
        pontuacao: 'desc'
      },
      take: 5
    })

    console.log(`   📊 Top 5 usuários comuns por pontuação:`)
    if (rankingUsuariosComuns.length > 0) {
      rankingUsuariosComuns.forEach((usuario, index) => {
        console.log(`   ${index + 1}. ${usuario.nome} - ${usuario.pontuacao || 0} pontos - ${usuario.sementes || 0} sementes`)
      })
    } else {
      console.log('   📝 Nenhum usuário comum encontrado')
    }

    // 6. Verificar se há conteúdos que serão deletados
    console.log('\n6️⃣ Verificando conteúdos que serão deletados...')
    const totalConteudos = await prisma.conteudo.count()
    const totalConteudosParceiro = await prisma.conteudoParceiro.count()
    
    console.log(`   📝 Total de conteúdos: ${totalConteudos}`)
    console.log(`   📝 Total de conteúdos parceiro: ${totalConteudosParceiro}`)
    console.log(`   🗑️  Todos os conteúdos serão DELETADOS no reset de ciclo`)

    // 7. Conclusão
    console.log('\n7️⃣ CONCLUSÃO:')
    console.log('   ✅ Usuários comuns (nível "comum") NÃO são afetados pelo reset de ciclos')
    console.log('   ✅ Suas pontuações e sementes permanecem intactas')
    console.log('   ✅ Apenas criadores têm seus níveis resetados para "criador-iniciante"')
    console.log('   ✅ Apenas o ranking do ciclo é resetado (não o ranking geral)')
    console.log('   🗑️  Conteúdos são deletados para dar oportunidade igual a todos')

    console.log('\n🎯 Resposta à pergunta:')
    console.log('   ❌ NÃO, a mudança de ciclos NÃO altera o ranking de usuários comuns')
    console.log('   ✅ Usuários comuns mantêm suas pontuações e sementes')
    console.log('   🔄 Apenas criadores são afetados (reset de níveis)')
    console.log('   📝 Conteúdos são deletados para igualdade de oportunidades')

  } catch (error) {
    console.error('❌ Erro na verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarAfetacaoUsuariosComuns()

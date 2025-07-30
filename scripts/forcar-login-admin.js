const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function forcarLoginAdmin() {
  console.log('🔧 FORÇANDO LOGIN ADMIN')
  console.log('=======================\n')

  try {
    // Buscar admin
    const admin = await prisma.usuario.findFirst({
      where: { nivel: '5' }
    })

    if (!admin) {
      console.log('❌ Admin não encontrado!')
      return
    }

    console.log('✅ Admin encontrado:')
    console.log(`   • Nome: ${admin.nome}`)
    console.log(`   • Email: ${admin.email}`)
    console.log(`   • Nível: ${admin.nivel}`)

    // Criar dados do usuário para localStorage
    const userData = {
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      tipo: admin.tipo,
      nivel: admin.nivel,
      sementes: admin.sementes,
      pontuacao: admin.pontuacao
    }

    console.log('\n📋 Comando para colar no console do navegador:')
    console.log('='.repeat(80))
    console.log(`localStorage.setItem('sementesplay_user', '${JSON.stringify(userData)}')`)
    console.log('='.repeat(80))

    console.log('\n🌐 URLs para testar:')
    console.log('   • http://localhost:3000/admin/saques')
    console.log('   • http://localhost:3000/admin/painel')
    console.log('   • http://localhost:3000/admin')

    console.log('\n📝 Passos:')
    console.log('1. Abra o navegador')
    console.log('2. Pressione F12 (console)')
    console.log('3. Cole o comando acima')
    console.log('4. Acesse uma das URLs')
    console.log('5. Pronto! 🎉')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar
forcarLoginAdmin() 
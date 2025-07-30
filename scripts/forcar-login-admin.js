const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function forcarLoginAdmin() {
  try {
    console.log('🔧 FORÇANDO LOGIN DO ADMIN')
    console.log('==========================\n')

    // Buscar admin existente
    const admin = await prisma.usuario.findFirst({
      where: {
        nivel: '5'
      }
    })

    if (!admin) {
      console.log('❌ Nenhum admin encontrado!')
      return
    }

    console.log('✅ Admin encontrado:')
    console.log(`   • Nome: ${admin.nome}`)
    console.log(`   • Email: ${admin.email}`)
    console.log(`   • Nível: ${admin.nivel}`)
    console.log(`   • ID: ${admin.id}`)
    console.log('\n📋 COMANDO PARA COLAR NO CONSOLE DO NAVEGADOR:')
    console.log('=' * 50)
    
    const userData = {
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      tipo: 'usuario',
      sementes: admin.sementes || 0,
      nivel: admin.nivel,
      pontuacao: admin.pontuacao || 0,
      dataCriacao: admin.dataCriacao?.toISOString()
    }

    const localStorageCommand = `localStorage.setItem('sementesplay_user', '${JSON.stringify(userData)}'); location.reload();`
    
    console.log(localStorageCommand)
    console.log('\n📝 INSTRUÇÕES:')
    console.log('1. Abra o console do navegador (F12)')
    console.log('2. Cole o comando acima')
    console.log('3. Pressione Enter')
    console.log('4. A página será recarregada automaticamente')
    console.log('5. Agora você deve conseguir acessar "Gerenciar Saques"')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forcarLoginAdmin() 
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function criarAdmin() {
  console.log('🔧 CRIANDO USUÁRIO ADMIN')
  console.log('========================\n')

  try {
    // Verificar se já existe um admin
    const adminExistente = await prisma.usuario.findFirst({
      where: {
        nivel: '5' // Nível admin
      }
    })

    if (adminExistente) {
      console.log('✅ Admin já existe:')
      console.log(`   • Nome: ${adminExistente.nome}`)
      console.log(`   • Email: ${adminExistente.email}`)
      console.log(`   • Nível: ${adminExistente.nivel}`)
      console.log(`   • ID: ${adminExistente.id}`)
      return
    }

    // Criar usuário admin
    const admin = await prisma.usuario.create({
      data: {
        nome: 'Administrador SementesPLAY',
        email: 'admin@sementesplay.com',
        senha: 'admin123', // Em produção seria hash
        tipo: 'usuario',
        nivel: '5', // Nível admin
        sementes: 0,
        pontuacao: 0
      }
    })

    console.log('✅ Admin criado com sucesso!')
    console.log(`   • Nome: ${admin.nome}`)
    console.log(`   • Email: ${admin.email}`)
    console.log(`   • Senha: admin123`)
    console.log(`   • Nível: ${admin.nivel}`)
    console.log(`   • ID: ${admin.id}`)
    console.log('\n🔑 Credenciais de acesso:')
    console.log('   • Email: admin@sementesplay.com')
    console.log('   • Senha: admin123')
    console.log('\n🌐 URLs de acesso:')
    console.log('   • Painel Admin: http://localhost:3000/admin')
    console.log('   • Gerenciar Saques: http://localhost:3000/admin/saques')
    console.log('   • Aprovar Repasses: http://localhost:3000/admin/painel')

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar
criarAdmin() 
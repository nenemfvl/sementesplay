const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function verificarLogin() {
  console.log('🔍 VERIFICANDO CREDENCIAIS DE LOGIN')
  console.log('==================================\n')

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
    console.log(`   • Senha no banco: ${admin.senha}`)

    // Testar senhas comuns
    const senhasTeste = ['123456', 'admin123', 'senha123', 'password', 'admin']
    
    console.log('\n🔑 Testando senhas...')
    
    for (const senha of senhasTeste) {
      // Verificar se a senha está hasheada ou em texto plano
      if (admin.senha === senha) {
        console.log(`✅ Senha encontrada (texto plano): ${senha}`)
        break
      }
      
      try {
        const senhaCorreta = await bcrypt.compare(senha, admin.senha)
        if (senhaCorreta) {
          console.log(`✅ Senha encontrada (hash): ${senha}`)
          break
        }
      } catch (error) {
        // Senha não está hasheada
      }
    }

    console.log('\n🌐 Para fazer login:')
    console.log('1. Acesse: https://sementesplay.vercel.app/login')
    console.log(`2. Email: ${admin.email}`)
    console.log('3. Senha: 123456 (ou a senha encontrada acima)')
    console.log('4. Clique em "Entrar"')
    console.log('5. Depois acesse: https://sementesplay.vercel.app/admin/saques')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar
verificarLogin() 
// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')
// const bcrypt = require('bcryptjs')

// const prisma = new PrismaClient()

// async function testarLoginAdmin() {
  console.log('🔐 TESTANDO LOGIN ADMIN')
  console.log('=======================\n')

  try {
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
    console.log(`   • Tipo: ${admin.tipo}`)

    // Simular login
    console.log('\n🔑 Simulando login...')
    
    // Verificar senha (assumindo que é 'admin123' ou similar)
    const senhasTeste = ['admin123', '123456', 'senha123', 'password']
    let senhaCorreta = null

    for (const senha of senhasTeste) {
      const senhaHash = await bcrypt.hash(senha, 10)
      const senhaAtualHash = admin.senha
      
      // Se a senha atual não está hasheada, comparar diretamente
      if (senhaAtualHash === senha || await bcrypt.compare(senha, senhaAtualHash)) {
        senhaCorreta = senha
        break
      }
    }

    if (senhaCorreta) {
      console.log(`✅ Senha encontrada: ${senhaCorreta}`)
      
      // Simular dados do usuário que seriam salvos no localStorage
      const userData = {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        tipo: admin.tipo,
        nivel: admin.nivel,
        sementes: admin.sementes,
        pontuacao: admin.pontuacao
      }

      console.log('\n📋 Dados do usuário para localStorage:')
      console.log(JSON.stringify(userData, null, 2))

      console.log('\n🌐 Para testar o acesso:')
      console.log('1. Abra o console do navegador (F12)')
      console.log('2. Cole este comando:')
      console.log(`localStorage.setItem('sementesplay_user', '${JSON.stringify(userData)}')`)
      console.log('3. Recarregue a página /admin/saques')
      console.log('4. Ou acesse: http://localhost:3000/admin/saques')

    } else {
      console.log('❌ Senha não encontrada!')
      console.log('Tente estas senhas:')
      senhasTeste.forEach(s => console.log(`   • ${s}`))
    }

//   } catch (error) {
//     console.error('❌ Erro:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // Executar
// testarLoginAdmin() 
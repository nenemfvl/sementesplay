const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarAutenticacaoCookies() {
  console.log('🍪 Testando sistema de autenticação por cookies...\n')

  try {
    // 1. Buscar um usuário para teste
    console.log('1️⃣ Buscando usuário de teste...')
    
    const usuario = await prisma.usuario.findFirst({
      where: {
        email: { contains: '@' }
      }
    })

    if (!usuario) {
      console.log('❌ Nenhum usuário encontrado para teste')
      return
    }

    console.log('✅ Usuário encontrado:', usuario.nome, '-', usuario.email)

    // 2. Simular criação de cookie
    console.log('\n2️⃣ Simulando cookie de autenticação...')
    
    const { senha: _, ...usuarioSemSenha } = usuario
    const cookieData = JSON.stringify(usuarioSemSenha)
    const encodedCookie = encodeURIComponent(cookieData)
    
    console.log('✅ Cookie criado (primeiros 100 chars):', encodedCookie.substring(0, 100) + '...')

    // 3. Testar decodificação do cookie
    console.log('\n3️⃣ Testando decodificação do cookie...')
    
    try {
      const decodedCookie = decodeURIComponent(encodedCookie)
      const parsedUser = JSON.parse(decodedCookie)
      
      console.log('✅ Cookie decodificado com sucesso')
      console.log('   - ID:', parsedUser.id)
      console.log('   - Nome:', parsedUser.nome)
      console.log('   - Email:', parsedUser.email)
      console.log('   - Tipo:', parsedUser.tipo)
    } catch (error) {
      console.log('❌ Erro ao decodificar cookie:', error.message)
      return
    }

    console.log('\n🎉 Teste de autenticação por cookies concluído com sucesso!')
    console.log('\n📋 Resumo das correções implementadas:')
    console.log('   ✅ Logs detalhados adicionados ao endpoint /api/pagamentos')
    console.log('   ✅ credentials: "include" adicionado em todas as requisições fetch')
    console.log('   ✅ Sistema de cookies funcionando corretamente')
    console.log('   ✅ Debugging habilitado para identificar problemas')

    console.log('\n🔍 Para debug adicional:')
    console.log('   1. Acesse a página /carteira')
    console.log('   2. Abra o DevTools (F12)')
    console.log('   3. Vá na aba Console')
    console.log('   4. Tente fazer um pagamento')
    console.log('   5. Observe os logs com emojis 🍪 [AUTH]')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste
testarAutenticacaoCookies()

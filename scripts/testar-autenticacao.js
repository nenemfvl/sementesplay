// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function testarAutenticacao() {
  console.log('🔍 Testando autenticação...')

  try {
    // Buscar um usuário parceiro para teste
    const usuarioParceiro = await prisma.usuario.findFirst({
      where: {
        nivel: 'parceiro'
      },
      include: {
        parceiro: true
      }
    })

    if (!usuarioParceiro) {
      console.log('❌ Nenhum usuário parceiro encontrado')
      return
    }

    console.log(`\n👤 Usuário parceiro encontrado:`)
    console.log(`   ID: ${usuarioParceiro.id}`)
    console.log(`   Nome: ${usuarioParceiro.nome}`)
    console.log(`   Email: ${usuarioParceiro.email}`)
    console.log(`   Nível: ${usuarioParceiro.nivel}`)
    console.log(`   Tipo: ${usuarioParceiro.tipo}`)
    console.log(`   Parceiro: ${usuarioParceiro.parceiro ? 'Sim' : 'Não'}`)

    if (usuarioParceiro.parceiro) {
      console.log(`   Parceiro ID: ${usuarioParceiro.parceiro.id}`)
      console.log(`   Parceiro Nome: ${usuarioParceiro.parceiro.nome}`)
    }

    // Simular o que acontece no painel parceiro
    console.log(`\n🔍 Simulando verificação do painel parceiro...`)
    
    // 1. Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioParceiro.id }
    })
    
    if (!usuario) {
      console.log('❌ Usuário não encontrado')
      return
    }
    
    console.log('✅ Usuário encontrado')

    // 2. Verificar se o parceiro existe
    const parceiro = await prisma.parceiro.findUnique({
      where: { usuarioId: usuarioParceiro.id }
    })
    
    if (!parceiro) {
      console.log('❌ Parceiro não encontrado para este usuário')
      return
    }
    
    console.log('✅ Parceiro encontrado')
    console.log(`   Parceiro ID: ${parceiro.id}`)
    console.log(`   Parceiro Nome: ${parceiro.nome}`)

    console.log('\n✅ Autenticação funcionando corretamente!')

//   } catch (error) {
//     console.error('❌ Erro durante teste:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// testarAutenticacao() 
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarNivelUsuario() {
  try {
    // Buscar usuário por email
    const email = 'vanislanleopoldinodasilva@gmail.com'
    
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        parceiro: true
      }
    })

    if (!usuario) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log('👤 Usuário encontrado:')
    console.log(`   Nome: ${usuario.nome}`)
    console.log(`   Email: ${usuario.email}`)
    console.log(`   Nível atual: ${usuario.nivel}`)
    console.log(`   Tem parceiro: ${usuario.parceiro ? 'Sim' : 'Não'}`)

    // Verificar se tem parceiro mas nível incorreto
    if (usuario.parceiro && usuario.nivel !== 'parceiro') {
      console.log('⚠️  Usuário tem parceiro mas nível incorreto!')
      console.log('🔄 Corrigindo nível...')
      
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { nivel: 'parceiro' }
      })

      console.log('✅ Nível corrigido para "parceiro"')
    } else if (usuario.parceiro && usuario.nivel === 'parceiro') {
      console.log('✅ Nível correto - usuário é parceiro')
    } else if (!usuario.parceiro && usuario.nivel === 'parceiro') {
      console.log('⚠️  Usuário tem nível parceiro mas não tem registro de parceiro!')
    } else {
      console.log('ℹ️  Usuário não é parceiro')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarNivelUsuario() 
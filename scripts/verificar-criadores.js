const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarCriadores() {
  try {
    console.log('🔍 Verificando criadores no banco de dados...')
    
    const criadores = await prisma.criador.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true
          }
        }
      }
    })
    
    console.log(`📊 Total de criadores encontrados: ${criadores.length}`)
    
    if (criadores.length === 0) {
      console.log('❌ Nenhum criador encontrado no banco de dados')
      console.log('💡 Dica: Crie alguns criadores primeiro através do sistema de candidaturas')
    } else {
      console.log('\n📋 Lista de criadores:')
      criadores.forEach((criador, index) => {
        console.log(`${index + 1}. ${criador.usuario.nome} (${criador.usuario.email}) - Nível: ${criador.nivel}`)
      })
    }
    
    // Verificar usuários com nível de criador
    const usuariosCriadores = await prisma.usuario.findMany({
      where: {
        nivel: {
          contains: 'criador'
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true
      }
    })
    
    console.log(`\n👥 Usuários com nível de criador: ${usuariosCriadores.length}`)
    usuariosCriadores.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nome} (${usuario.email}) - Nível: ${usuario.nivel}`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar criadores:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarCriadores() 
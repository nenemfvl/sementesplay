// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function verificarCriadores() {
  try {
    console.log('🔍 Verificando criadores no banco de dados...')
    
    // Buscar todos os criadores
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
    
    if (criadores.length > 0) {
      console.log('\n📋 Lista de criadores:')
      criadores.forEach((criador, index) => {
        console.log(`${index + 1}. ${criador.usuario.nome} (${criador.usuario.email})`)
        console.log(`   - Nível do Usuário: ${criador.usuario.nivel}`)
        console.log(`   - Nível do Criador: ${criador.nivel}`)
        console.log(`   - Doações: ${criador.doacoes || 0}`)
        console.log(`   - Apoiadores: ${criador.apoiadores || 0}`)
        console.log('')
      })
    } else {
      console.log('❌ Nenhum criador encontrado no banco de dados')
    }
    
    // Verificar usuários que poderiam ser criadores
    const usuarios = await prisma.usuario.findMany({
      where: {
        nivel: {
          in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true
      }
    })
    
    console.log(`\n👥 Usuários com nível de criador: ${usuarios.length}`)
    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nome} (${usuario.email}) - Nível: ${usuario.nivel}`)
    })
    
//   } catch (error) {
//     console.error('❌ Erro:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// verificarCriadores() 
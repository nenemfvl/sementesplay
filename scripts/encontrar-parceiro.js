const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function encontrarParceiro() {
  try {
    console.log('🔍 Encontrando parceiro costaoeste...')
    
    // Buscar o parceiro pelo nome
    const parceiro = await prisma.parceiro.findFirst({
      where: {
        nomeCidade: 'costaoeste'
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    })
    
    if (parceiro) {
      console.log('✅ Parceiro encontrado!')
      console.log(`  - ID do Parceiro: ${parceiro.id}`)
      console.log(`  - ID do Usuário: ${parceiro.usuarioId}`)
      console.log(`  - Nome: ${parceiro.usuario.nome}`)
      console.log(`  - Email: ${parceiro.usuario.email}`)
      console.log(`  - Cidade: ${parceiro.nomeCidade}`)
    } else {
      console.log('❌ Parceiro não encontrado')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

encontrarParceiro() 
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarParceiros() {
  try {
    const parceiros = await prisma.parceiro.findMany({
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

    console.log('Parceiros encontrados:', parceiros.length)
    parceiros.forEach(parceiro => {
      console.log(`- ID: ${parceiro.id}`)
      console.log(`  Usuario ID: ${parceiro.usuarioId}`)
      console.log(`  Nome: ${parceiro.usuario.nome}`)
      console.log(`  Email: ${parceiro.usuario.email}`)
      console.log('---')
    })

  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarParceiros() 
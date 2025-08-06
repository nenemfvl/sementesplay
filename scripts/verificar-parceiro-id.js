// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function verificarParceiroId() {
  try {
    const parceiro = await prisma.parceiro.findFirst({
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
      console.log('Dados do parceiro:')
      console.log(`- Parceiro ID: ${parceiro.id}`)
      console.log(`- Usuario ID: ${parceiro.usuarioId}`)
      console.log(`- Nome: ${parceiro.usuario.nome}`)
      console.log(`- Email: ${parceiro.usuario.email}`)
      
      // Simular o que a API de ranking retorna
      const parceiroFormatado = {
        id: parceiro.id, // Este é o ID que está sendo usado na URL
        nome: parceiro.usuario.nome,
        usuarioId: parceiro.usuarioId // Este é o ID que a API de perfil espera
      }
      
      console.log('\nDados formatados (como a API de ranking retorna):')
      console.log(parceiroFormatado)
    }

//   } catch (error) {
//     console.error('Erro:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// verificarParceiroId() 
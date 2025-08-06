// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function verificarCandidaturas() {
  try {
    console.log('Verificando candidaturas de criadores...')
    
    const candidaturas = await prisma.candidaturaCriador.findMany({
      include: {
        usuario: {
          select: {
            nome: true,
            email: true,
            nivel: true
          }
        }
      }
    })
    
    console.log(`Total de candidaturas encontradas: ${candidaturas.length}`)
    
    if (candidaturas.length > 0) {
      console.log('\nCandidaturas:')
      candidaturas.forEach((candidatura, index) => {
        console.log(`${index + 1}. ${candidatura.nome} (${candidatura.email}) - Status: ${candidatura.status}`)
      })
    } else {
      console.log('Nenhuma candidatura encontrada.')
    }
    
    // Verificar também candidaturas de parceiros
    console.log('\nVerificando candidaturas de parceiros...')
    const candidaturasParceiro = await prisma.candidaturaParceiro.findMany()
    console.log(`Total de candidaturas de parceiros: ${candidaturasParceiro.length}`)
    
//   } catch (error) {
//     console.error('Erro ao verificar candidaturas:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// verificarCandidaturas() 
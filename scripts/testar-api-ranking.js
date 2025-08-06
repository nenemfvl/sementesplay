// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function testarAPIRanking() {
  try {
    console.log('🔍 Testando API de ranking de parceiros...')
    
    // Simular a mesma lógica da API
    const parceiros = await prisma.parceiro.findMany({
      where: {
        usuario: {
          nivel: 'parceiro'
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
            nivel: true,
            sementes: true,
            dataCriacao: true
          }
        },
      }
    })

    console.log(`\n📊 Parceiros encontrados: ${parceiros.length}`)
    
    // Formatar dados dos parceiros (mesma lógica da API)
    const parceirosFormatados = parceiros.map((parceiro, index) => ({
      id: parceiro.id,
      nome: parceiro.usuario.nome,
      email: parceiro.usuario.email,
      avatar: parceiro.usuario.avatarUrl || '🏢',
      nivel: parceiro.usuario.nivel,
      sementes: parceiro.usuario.sementes,
      nomeCidade: parceiro.nomeCidade,
      comissaoMensal: parceiro.comissaoMensal,
      totalVendas: parceiro.totalVendas,
      codigosGerados: parceiro.codigosGerados,
      posicao: index + 1,
      dataCriacao: parceiro.usuario.dataCriacao,
    }))

    // Ordenar por total de vendas (maior para menor)
    parceirosFormatados.sort((a, b) => b.totalVendas - a.totalVendas)

    console.log('\n📋 Dados formatados que seriam retornados pela API:')
    parceirosFormatados.forEach(parceiro => {
      console.log(`  - ${parceiro.nomeCidade} - ${parceiro.nome}`)
      console.log(`    ID: ${parceiro.id}`)
      console.log(`    Email: ${parceiro.email}`)
      console.log(`    Total Vendas: R$ ${parceiro.totalVendas}`)
      console.log(`    Códigos Gerados: ${parceiro.codigosGerados}`)
      console.log('')
    })

    console.log('✅ API funcionando corretamente!')
    
//   } catch (error) {
//     console.error('❌ Erro:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// testarAPIRanking() 
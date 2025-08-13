const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarConteudosInstagram() {
  try {
    console.log('🔍 Verificando conteúdos do Instagram dos parceiros...')

    // Verificar todos os conteúdos dos parceiros
    const todosConteudos = await prisma.conteudoParceiro.findMany({
      include: {
        parceiro: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        }
      },
      orderBy: {
        dataPublicacao: 'desc'
      }
    })

    console.log(`\n📊 Total de conteúdos encontrados: ${todosConteudos.length}`)

    // Verificar conteúdos por plataforma
    const conteudosPorPlataforma = await prisma.conteudoParceiro.groupBy({
      by: ['plataforma'],
      _count: {
        plataforma: true
      }
    })

    console.log('\n📱 Conteúdos por plataforma:')
    conteudosPorPlataforma.forEach(item => {
      console.log(`- ${item.plataforma}: ${item._count.plataforma}`)
    })

    // Verificar conteúdos do Instagram especificamente
    const conteudosInstagram = await prisma.conteudoParceiro.findMany({
      where: {
        plataforma: 'instagram'
      },
      include: {
        parceiro: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        }
      }
    })

    console.log(`\n📷 Conteúdos do Instagram encontrados: ${conteudosInstagram.length}`)

    if (conteudosInstagram.length > 0) {
      console.log('\n📋 Detalhes dos conteúdos do Instagram:')
      conteudosInstagram.forEach((conteudo, index) => {
        console.log(`\n${index + 1}. ${conteudo.titulo}`)
        console.log(`   - Parceiro: ${conteudo.parceiro.usuario.nome}`)
        console.log(`   - URL: ${conteudo.url}`)
        console.log(`   - Tipo: ${conteudo.tipo}`)
        console.log(`   - Categoria: ${conteudo.categoria}`)
        console.log(`   - Visualizações: ${conteudo.visualizacoes}`)
        console.log(`   - Data: ${conteudo.dataPublicacao}`)
        console.log(`   - Removido: ${conteudo.removido}`)
      })
    }

    // Verificar se há algum problema com o campo removido
    const conteudosRemovidos = await prisma.conteudoParceiro.findMany({
      where: {
        removido: true
      }
    })

    console.log(`\n🗑️ Conteúdos removidos: ${conteudosRemovidos.length}`)

    // Verificar se há algum problema com o campo plataforma
    const conteudosSemPlataforma = await prisma.conteudoParceiro.findMany({
      where: {
        OR: [
          { plataforma: null },
          { plataforma: '' }
        ]
      }
    })

    console.log(`\n❓ Conteúdos sem plataforma definida: ${conteudosSemPlataforma.length}`)

    if (conteudosSemPlataforma.length > 0) {
      console.log('\n⚠️ Conteúdos sem plataforma:')
      conteudosSemPlataforma.forEach((conteudo, index) => {
        console.log(`${index + 1}. ${conteudo.titulo} - ${conteudo.url}`)
      })
    }

  } catch (error) {
    console.error('❌ Erro ao verificar conteúdos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarConteudosInstagram()
}

module.exports = { verificarConteudosInstagram }

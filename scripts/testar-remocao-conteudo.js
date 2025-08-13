const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarRemocaoConteudo() {
  try {
    console.log('🧪 Testando remoção de conteúdo dos parceiros...')

    // Buscar um conteúdo do Instagram para testar
    const conteudoParaRemover = await prisma.conteudoParceiro.findFirst({
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

    if (!conteudoParaRemover) {
      console.log('❌ Nenhum conteúdo do Instagram encontrado para testar')
      return
    }

    console.log(`\n📋 Conteúdo selecionado para teste:`)
    console.log(`- ID: ${conteudoParaRemover.id}`)
    console.log(`- Título: ${conteudoParaRemover.titulo}`)
    console.log(`- Parceiro: ${conteudoParaRemover.parceiro.usuario.nome}`)
    console.log(`- Plataforma: ${conteudoParaRemover.plataforma}`)

    // Verificar se o conteúdo existe antes da remoção
    const conteudoAntes = await prisma.conteudoParceiro.findUnique({
      where: { id: conteudoParaRemover.id }
    })

    if (!conteudoAntes) {
      console.log('❌ Conteúdo não encontrado antes da remoção')
      return
    }

    console.log('\n✅ Conteúdo encontrado antes da remoção')

    // Simular a remoção (não remover de verdade)
    console.log('\n🔄 Simulando remoção...')
    console.log('⚠️  Para remover de verdade, descomente a linha abaixo')

    // DESCOMENTE A LINHA ABAIXO PARA REMOVER DE VERDADE:
    // await prisma.conteudoParceiro.delete({ where: { id: conteudoParaRemover.id } })

    console.log('✅ Simulação concluída com sucesso!')
    console.log('\n📊 Para testar a API real:')
    console.log('1. Inicie o servidor: npm run dev')
    console.log('2. Acesse: http://localhost:3000/painel-parceiro')
    console.log('3. Tente remover um conteúdo')

  } catch (error) {
    console.error('❌ Erro ao testar remoção:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testarRemocaoConteudo()
}

module.exports = { testarRemocaoConteudo }

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function zerarPontuacaoFavela() {
  try {
    console.log('🔍 Zerando pontuação do usuário favela...')
    
    // Buscar usuário por nome
    const usuario = await prisma.usuario.findFirst({
      where: { nome: 'favela' }
    })
    
    if (!usuario) {
      console.log('❌ Usuário favela não encontrado!')
      return
    }
    
    console.log(`\n👤 Usuário encontrado:`)
    console.log(`   ID: ${usuario.id}`)
    console.log(`   Nome: ${usuario.nome}`)
    console.log(`   Pontuação atual: ${usuario.pontuacao || 0}`)
    
    // Zerar pontuação
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { pontuacao: 0 }
    })
    
    console.log(`\n✅ Pontuação zerada com sucesso!`)
    console.log(`   Nova pontuação: ${usuarioAtualizado.pontuacao}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

zerarPontuacaoFavela()

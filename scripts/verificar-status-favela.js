const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarStatusFavela() {
  try {
    console.log('🔍 Verificando status do usuário favela...')
    
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
    console.log(`   Email: ${usuario.email}`)
    console.log(`   Nível: ${usuario.nivel}`)
    console.log(`   Pontuação: ${usuario.pontuacao || 0}`)
    
    // Verificar se ainda existe registro de criador
    const criador = await prisma.criador.findUnique({
      where: { usuarioId: usuario.id }
    })
    
    if (criador) {
      console.log(`\n🎭 Criador ainda existe:`)
      console.log(`   ID: ${criador.id}`)
      console.log(`   Nome: ${criador.nome}`)
      console.log(`   Categoria: ${criador.categoria}`)
      console.log(`   Nível: ${criador.nivel}`)
      console.log(`   Sementes: ${criador.sementes}`)
      console.log(`   Apoiadores: ${criador.apoiadores}`)
      console.log(`   Doações: ${criador.doacoes}`)
    } else {
      console.log(`\n✅ Registro de criador foi removido`)
    }
    
    // Verificar registros de ranking
    const rankingCiclo = await prisma.rankingCiclo.findMany({
      where: { usuarioId: usuario.id }
    })
    
    const rankingSeason = await prisma.rankingSeason.findMany({
      where: { usuarioId: usuario.id }
    })
    
    console.log(`\n🏆 Registros de ranking:`)
    console.log(`   RankingCiclo: ${rankingCiclo.length} registros`)
    console.log(`   RankingSeason: ${rankingSeason.length} registros`)
    
    // Verificar se ainda tem dados relacionados
    const doacoes = await prisma.doacao.count({
      where: { criadorId: criador?.id || 'inexistente' }
    })
    
    const conteudos = await prisma.conteudo.count({
      where: { criadorId: criador?.id || 'inexistente' }
    })
    
    const enquetes = await prisma.enquete.count({
      where: { criadorId: criador?.id || 'inexistente' }
    })
    
    console.log(`\n📊 Dados relacionados:`)
    console.log(`   Doações recebidas: ${doacoes}`)
    console.log(`   Conteúdos: ${conteudos}`)
    console.log(`   Enquetes: ${enquetes}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarStatusFavela()

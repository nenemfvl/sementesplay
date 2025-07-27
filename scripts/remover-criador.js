const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removerCriador() {
  try {
    console.log('=== Removendo Registro de Criador ===\n')
    
    // Buscar candidatura aprovada
    const candidatura = await prisma.candidaturaCriador.findFirst({
      where: { status: 'aprovada' },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            nivel: true
          }
        }
      }
    })
    
    if (!candidatura) {
      console.log('Nenhuma candidatura aprovada encontrada')
      return
    }
    
    console.log('Candidatura encontrada:')
    console.log(`  Nome: ${candidatura.nome}`)
    console.log(`  Status: ${candidatura.status}`)
    console.log(`  Usuário ID: ${candidatura.usuarioId}`)
    console.log(`  Nível atual: ${candidatura.usuario.nivel}`)
    console.log(`  Tipo atual: ${candidatura.usuario.tipo}`)
    
    // Verificar se existe registro de criador
    const criador = await prisma.criador.findFirst({
      where: { usuarioId: candidatura.usuarioId }
    })
    
    if (!criador) {
      console.log('\nNenhum registro de criador encontrado para remover')
      return
    }
    
    console.log('\nRegistro de Criador encontrado:')
    console.log(`  ID: ${criador.id}`)
    console.log(`  Nome: ${criador.nome}`)
    console.log(`  Categoria: ${criador.categoria}`)
    
    // Verificar se o usuário ainda tem nível de criador
    const niveisCriador = ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
    const aindaEhCriador = niveisCriador.includes(candidatura.usuario.nivel)
    
    if (aindaEhCriador) {
      console.log('\n⚠️  Usuário ainda tem nível de criador. Não removendo registro.')
      console.log(`   Nível atual: ${candidatura.usuario.nivel}`)
      return
    }
    
    // Remover registro de criador
    console.log('\n🗑️  Removendo registro de criador...')
    await prisma.criador.delete({
      where: { id: criador.id }
    })
    
    console.log('✅ Registro de criador removido com sucesso!')
    console.log('\nAgora o usuário não aparecerá mais no ranking de criadores.')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removerCriador() 
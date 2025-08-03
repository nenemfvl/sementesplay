const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function corrigirMissaoPrimeiraDoacao() {
  try {
    console.log('=== CORRIGINDO MISSÃO PRIMEIRA DOAÇÃO ===')
    
    // Buscar a missão existente
    const missao = await prisma.missao.findFirst({
      where: { titulo: 'Primeira Doação' }
    })
    
    if (!missao) {
      console.log('Missão "Primeira Doação" não encontrada')
      return
    }
    
    console.log('Missão encontrada:', missao)
    
    // Atualizar a missão
    const missaoAtualizada = await prisma.missao.update({
      where: { id: missao.id },
      data: {
        tipo: 'doacao',
        ativa: true,
        recompensa: 0,
        emblema: '🎯'
      }
    })
    
    console.log('Missão atualizada:', missaoAtualizada)
    
    // Verificar se foi atualizada corretamente
    const missaoVerificada = await prisma.missao.findFirst({
      where: { titulo: 'Primeira Doação' }
    })
    
    console.log('Missão após correção:', missaoVerificada)
    
  } catch (error) {
    console.error('Erro ao corrigir missão:', error)
  } finally {
    await prisma.$disconnect()
  }
}

corrigirMissaoPrimeiraDoacao() 
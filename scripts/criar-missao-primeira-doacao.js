const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function criarMissaoPrimeiraDoacao() {
  try {
    console.log('=== CRIANDO MISSÃO PRIMEIRA DOAÇÃO ===')
    
    // Verificar se já existe
    const missaoExistente = await prisma.missao.findFirst({
      where: { titulo: 'Primeira Doação' }
    })
    
    if (missaoExistente) {
      console.log('Missão "Primeira Doação" já existe:', missaoExistente)
      return
    }
    
    // Criar a missão
    const novaMissao = await prisma.missao.create({
      data: {
        titulo: 'Primeira Doação',
        descricao: 'Faça sua primeira doação para um criador',
        tipo: 'doacao',
        objetivo: 1,
        recompensa: 0,
        emblema: '🎯',
        ativa: true
      }
    })
    
    console.log('Missão "Primeira Doação" criada com sucesso:', novaMissao)
    
    // Verificar se foi criada
    const missaoCriada = await prisma.missao.findFirst({
      where: { titulo: 'Primeira Doação' }
    })
    
    console.log('Missão encontrada após criação:', missaoCriada)
    
  } catch (error) {
    console.error('Erro ao criar missão:', error)
  } finally {
    await prisma.$disconnect()
  }
}

criarMissaoPrimeiraDoacao() 
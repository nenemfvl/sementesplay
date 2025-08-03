const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarMissaoPrimeiraDoacao() {
  try {
    console.log('=== VERIFICANDO MISSÃO PRIMEIRA DOAÇÃO ===')
    
    // 1. Buscar missão Primeira Doação
    const missao = await prisma.missao.findFirst({
      where: { 
        titulo: 'Primeira Doação',
        ativa: true
      }
    })
    
    if (missao) {
      console.log('Missão encontrada:', {
        id: missao.id,
        titulo: missao.titulo,
        tipo: missao.tipo,
        objetivo: missao.objetivo,
        ativa: missao.ativa
      })
    } else {
      console.log('Missão "Primeira Doação" não encontrada!')
      
      // Listar todas as missões para debug
      const todasMissoes = await prisma.missao.findMany({
        where: { ativa: true }
      })
      console.log('\nTodas as missões ativas:')
      todasMissoes.forEach(m => {
        console.log(`- ${m.titulo} (${m.tipo}) - Objetivo: ${m.objetivo}`)
      })
    }
    
    // 2. Buscar conquista Primeira Doação
    const conquista = await prisma.conquista.findFirst({
      where: { 
        titulo: 'Primeira Doação',
        ativa: true
      }
    })
    
    if (conquista) {
      console.log('\nConquista encontrada:', {
        id: conquista.id,
        titulo: conquista.titulo,
        tipo: conquista.tipo,
        ativa: conquista.ativa
      })
    } else {
      console.log('\nConquista "Primeira Doação" não encontrada!')
    }
    
    // 3. Testar busca por tipo 'doacao'
    console.log('\n=== TESTANDO BUSCA POR TIPO ===')
    const missoesDoacao = await prisma.missao.findMany({
      where: {
        tipo: 'doacao',
        ativa: true
      }
    })
    
    console.log(`Missões do tipo 'doacao': ${missoesDoacao.length}`)
    missoesDoacao.forEach(m => {
      console.log(`- ${m.titulo} (${m.tipo}) - Objetivo: ${m.objetivo}`)
    })
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarMissaoPrimeiraDoacao() 
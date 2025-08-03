const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarXPRecente() {
  try {
    const userId = 'cmdqhksir0000l804cxot2lvi'
    
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        xp: true,
        nivelUsuario: true
      }
    })

    console.log('=== USUÁRIO ATUAL ===')
    console.log(`Nome: ${usuario.nome}`)
    console.log(`XP: ${usuario.xp}`)
    console.log(`Nível: ${usuario.nivelUsuario}`)

    // Buscar doações das últimas 2 horas
    const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000)
    
    const doacoesRecentes = await prisma.doacao.findMany({
      where: {
        doadorId: userId,
        data: {
          gte: duasHorasAtras
        }
      },
      orderBy: { data: 'desc' }
    })

    console.log(`\n=== DOAÇÕES RECENTES (últimas 2h): ${doacoesRecentes.length} ===`)
    doacoesRecentes.forEach((doacao, index) => {
      console.log(`${index + 1}. ${doacao.quantidade} sementes - ${doacao.data}`)
    })

    // Buscar histórico de XP das últimas 2 horas
    const historicoRecente = await prisma.historicoXP.findMany({
      where: {
        usuarioId: userId,
        data: {
          gte: duasHorasAtras
        }
      },
      orderBy: { data: 'desc' }
    })

    console.log(`\n=== HISTÓRICO XP RECENTE (últimas 2h): ${historicoRecente.length} ===`)
    historicoRecente.forEach((registro, index) => {
      console.log(`${index + 1}. ${registro.descricao}`)
      console.log(`   XP: ${registro.xpAnterior} → ${registro.xpPosterior} (+${registro.xpGanho})`)
      console.log(`   Data: ${registro.data}`)
      console.log('')
    })

    // Calcular XP esperado
    const xpEsperado = doacoesRecentes.length * 10 // 10 XP por doação
    console.log(`\n=== CÁLCULO ===`)
    console.log(`Doações recentes: ${doacoesRecentes.length}`)
    console.log(`XP esperado das doações: ${doacoesRecentes.length} × 10 = ${xpEsperado} XP`)
    console.log(`XP atual no banco: ${usuario.xp}`)

  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarXPRecente() 
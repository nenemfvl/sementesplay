const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarXPUsuario() {
  try {
    // Buscar usuário faafaa
    const usuario = await prisma.usuario.findFirst({
      where: { nome: 'faafaa' },
      select: {
        id: true,
        nome: true,
        xp: true,
        nivelUsuario: true,
        nivel: true
      }
    })

    if (!usuario) {
      console.log('Usuário faafaa não encontrado')
      return
    }

    console.log('=== DADOS DO USUÁRIO ===')
    console.log(`ID: ${usuario.id}`)
    console.log(`Nome: ${usuario.nome}`)
    console.log(`XP: ${usuario.xp}`)
    console.log(`Nível Usuário: ${usuario.nivelUsuario}`)
    console.log(`Nível: ${usuario.nivel}`)

    // Buscar histórico de XP
    const historicoXP = await prisma.historicoXP.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { data: 'desc' },
      take: 5
    })

    console.log('\n=== ÚLTIMOS 5 REGISTROS DE XP ===')
    historicoXP.forEach((registro, index) => {
      console.log(`${index + 1}. ${registro.descricao}`)
      console.log(`   XP Ganho: ${registro.xpGanho}`)
      console.log(`   XP Anterior: ${registro.xpAnterior} → XP Posterior: ${registro.xpPosterior}`)
      console.log(`   Nível: ${registro.nivelAnterior} → ${registro.nivelPosterior}`)
      console.log(`   Data: ${registro.data}`)
      console.log('')
    })

    // Buscar doações recentes
    const doacoes = await prisma.doacao.findMany({
      where: { doadorId: usuario.id },
      orderBy: { data: 'desc' },
      take: 5
    })

    console.log('=== ÚLTIMAS 5 DOAÇÕES ===')
    doacoes.forEach((doacao, index) => {
      console.log(`${index + 1}. ${doacao.quantidade} sementes - ${doacao.data}`)
    })

  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarXPUsuario() 
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarDoacaoXP() {
  try {
    const userId = 'cmdqhksir0000l804cxot2lvi'
    const criadorId = 'cmdqhksir0000l804cxot2lvi' // Usando o mesmo ID para teste
    
    console.log('=== TESTE DE DOAÇÃO COM XP ===')
    console.log(`Doador ID: ${userId}`)
    console.log(`Criador ID: ${criadorId}`)
    
    // Verificar XP antes
    const usuarioAntes = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { xp: true, nivelUsuario: true }
    })
    
    console.log(`\nXP antes: ${usuarioAntes.xp}`)
    console.log(`Nível antes: ${usuarioAntes.nivelUsuario}`)
    
    // Simular doação
    const quantidade = 1
    const xpPorDoacao = 10
    
    console.log(`\nSimulando doação de ${quantidade} semente...`)
    console.log(`XP esperado: +${xpPorDoacao}`)
    
    // Atualizar XP
    const usuarioDepois = await prisma.usuario.update({
      where: { id: userId },
      data: { 
        xp: { increment: xpPorDoacao }
      },
      select: { xp: true, nivelUsuario: true }
    })
    
    console.log(`\nXP depois: ${usuarioDepois.xp}`)
    console.log(`Nível depois: ${usuarioDepois.nivelUsuario}`)
    console.log(`XP ganho: ${usuarioDepois.xp - usuarioAntes.xp}`)
    
    // Verificar se subiu de nível
    const novoNivel = Math.floor(usuarioDepois.xp / 100) + 1
    console.log(`Novo nível calculado: ${novoNivel}`)
    
    if (novoNivel > usuarioDepois.nivelUsuario) {
      console.log('Atualizando nível...')
      await prisma.usuario.update({
        where: { id: userId },
        data: { nivelUsuario: novoNivel }
      })
      console.log(`Nível atualizado para: ${novoNivel}`)
    }
    
    // Criar histórico
    await prisma.historicoXP.create({
      data: {
        usuarioId: userId,
        xpGanho: xpPorDoacao,
        xpAnterior: usuarioAntes.xp,
        xpPosterior: usuarioDepois.xp,
        nivelAnterior: usuarioAntes.nivelUsuario,
        nivelPosterior: novoNivel,
        fonte: 'doacao',
        descricao: `XP ganho por doação de ${quantidade} semente (teste)`
      }
    })
    
    console.log('\nHistórico de XP criado com sucesso!')
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarDoacaoXP() 
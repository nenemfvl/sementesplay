// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function migrarXPUsuarios() {
  try {
    console.log('🔄 Migrando XP para usuários existentes...')

    // Buscar todos os usuários
    const usuarios = await prisma.usuario.findMany()

    for (const usuario of usuarios) {
      let xpTotal = 0
      const historico = []

      // XP por doações feitas
      const doacoes = await prisma.doacao.count({
        where: { doadorId: usuario.id }
      })
      const xpDoacoes = doacoes * 25 // 25 XP por doação
      xpTotal += xpDoacoes
      if (xpDoacoes > 0) {
        historico.push(`Doações: ${doacoes} (${xpDoacoes} XP)`)
      }

      // XP por missões completadas
      const missoesCompletadas = await prisma.missaoUsuario.count({
        where: { 
          usuarioId: usuario.id,
          concluida: true
        }
      })
      const xpMissoes = missoesCompletadas * 50 // 50 XP por missão
      xpTotal += xpMissoes
      if (xpMissoes > 0) {
        historico.push(`Missões: ${missoesCompletadas} (${xpMissoes} XP)`)
      }

      // XP por tempo na plataforma (dias desde criação)
      const diasNaPlataforma = Math.floor((new Date() - usuario.dataCriacao) / (1000 * 60 * 60 * 24))
      const xpTempo = Math.min(diasNaPlataforma * 5, 500) // 5 XP por dia, máximo 500
      xpTotal += xpTempo
      if (xpTempo > 0) {
        historico.push(`Tempo na plataforma: ${diasNaPlataforma} dias (${xpTempo} XP)`)
      }

      // XP por ser criador
      const criador = await prisma.criador.findUnique({
        where: { usuarioId: usuario.id }
      })
      if (criador) {
        const xpCriador = 200 // 200 XP por ser criador
        xpTotal += xpCriador
        historico.push(`Criador: ${xpCriador} XP`)
      }

      // XP por ser parceiro
      const parceiro = await prisma.parceiro.findUnique({
        where: { usuarioId: usuario.id }
      })
      if (parceiro) {
        const xpParceiro = 300 // 300 XP por ser parceiro
        xpTotal += xpParceiro
        historico.push(`Parceiro: ${xpParceiro} XP`)
      }

      // Calcular nível baseado no XP
      const nivelUsuario = Math.floor(1 + Math.sqrt(xpTotal / 100))

      // Atualizar usuário
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          xp: xpTotal,
          nivelUsuario: nivelUsuario
        }
      })

      // Registrar no histórico se houve XP
      if (xpTotal > 0) {
        await prisma.historicoXP.create({
          data: {
            usuarioId: usuario.id,
            xpGanho: xpTotal,
            xpAnterior: 0,
            xpPosterior: xpTotal,
            nivelAnterior: 1,
            nivelPosterior: nivelUsuario,
            fonte: 'migracao',
            descricao: `Migração inicial: ${historico.join(', ')}`
          }
        })
      }

      console.log(`✅ ${usuario.nome}: ${xpTotal} XP (Nível ${nivelUsuario}) - ${historico.join(', ')}`)
    }

    console.log('🎉 Migração de XP concluída com sucesso!')
//   } catch (error) {
//     console.error('❌ Erro na migração:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// migrarXPUsuarios() 
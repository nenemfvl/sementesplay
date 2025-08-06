// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient()

// async function simularMissaoCompleta() {
//   try {
//     console.log('🎯 Simulando missão completa...')
    
//     // Buscar um usuário
//     const usuario = await prisma.usuario.findFirst()
//     if (!usuario) {
//       console.log('❌ Nenhum usuário encontrado')
//       return
//     }
    
//     console.log(`👤 Usuário: ${usuario.nome} (${usuario.id})`)
    
//     // Buscar uma missão simples (Login Diário)
//     const missao = await prisma.missao.findFirst({
//       where: {
//         titulo: 'Login Diário'
//       }
//     })
    
//     if (!missao) {
//       console.log('❌ Missão "Login Diário" não encontrada')
//       return
//     }
    
//     console.log(`🎯 Missão: ${missao.titulo} (${missao.id})`)
//     console.log(`   Objetivo: ${missao.objetivo}`)
//     console.log(`   Recompensa: ${missao.recompensa} XP`)
    
//     // Criar ou atualizar progresso do usuário
//     let missaoUsuario = await prisma.missaoUsuario.findFirst({
//       where: {
//         missaoId: missao.id,
//         usuarioId: usuario.id
//       }
//     })
    
//     if (missaoUsuario) {
//       console.log('📝 Atualizando missão existente...')
//       missaoUsuario = await prisma.missaoUsuario.update({
//         where: { id: missaoUsuario.id },
//         data: {
//           progresso: missao.objetivo,
//           concluida: true,
//           reivindicada: false,
//           dataConclusao: new Date()
//         }
//       })
//     } else {
//       console.log('📝 Criando nova missão para o usuário...')
//       missaoUsuario = await prisma.missaoUsuario.create({
//         data: {
//           missaoId: missao.id,
//           usuarioId: usuario.id,
//           progresso: missao.objetivo,
//           concluida: true,
//           reivindicada: false,
//           dataConclusao: new Date()
//         }
//       })
//     }
    
//     console.log(`✅ Missão marcada como concluída!`)
//     console.log(`   Progresso: ${missaoUsuario.progresso}/${missao.objetivo}`)
//     console.log(`   Concluída: ${missaoUsuario.concluida}`)
//     console.log(`   Reivindicada: ${missaoUsuario.reivindicada}`)
    
//     // Agora simular a reivindicação
//     console.log('\n🎉 Simulando reivindicação...')
    
//     // Marcar como reivindicada
//     await prisma.missaoUsuario.update({
//       where: { id: missaoUsuario.id },
//       data: { reivindicada: true }
//     })
    
//     // Atualizar XP
//     const novoXP = usuario.xp + missao.recompensa
//     await prisma.usuario.update({
//       where: { id: usuario.id },
//       data: { xp: novoXP }
//     })
    
//     // Criar histórico XP
//     await prisma.historicoXP.create({
//       data: {
//         usuarioId: usuario.id,
//         xpGanho: missao.recompensa,
//         xpAnterior: usuario.xp,
//         xpPosterior: novoXP,
//         nivelAnterior: parseInt(usuario.nivel) || 1,
//         nivelPosterior: parseInt(usuario.nivel) || 1,
//         fonte: 'missao',
//         descricao: `XP ganho por completar a missão: ${missao.titulo}`
//       }
//     })
    
//     // Criar notificação
//     const notificacao = await prisma.notificacao.create({
//       data: {
//         usuarioId: usuario.id,
//         tipo: 'missao',
//         titulo: 'Missão Completada!',
//         mensagem: `Você ganhou ${missao.recompensa} XP por completar a missão "${missao.titulo}"!`,
//         lida: false
//       }
//     })
    
//     console.log(`🎉 Notificação criada com sucesso!`)
//     console.log(`   ID: ${notificacao.id}`)
//     console.log(`   Título: ${notificacao.titulo}`)
//     console.log(`   Mensagem: ${notificacao.mensagem}`)
//     console.log(`   Tipo: ${notificacao.tipo}`)
//     console.log(`   Lida: ${notificacao.lida}`)
    
//     console.log(`\n📊 Resumo:`)
//     console.log(`   XP anterior: ${usuario.xp}`)
//     console.log(`   XP atual: ${novoXP}`)
//     console.log(`   XP ganho: ${missao.recompensa}`)
    
//   } catch (error) {
//     console.error('❌ Erro:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// simularMissaoCompleta() 
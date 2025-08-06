// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient()

// async function testarReivindicarMissao() {
  try {
    console.log('🎯 Testando sistema de reivindicar missão...')
    
    // Buscar um usuário
    const usuario = await prisma.usuario.findFirst()
    if (!usuario) {
      console.log('❌ Nenhum usuário encontrado')
      return
    }
    
    console.log(`👤 Usuário: ${usuario.nome} (${usuario.id})`)
    
    // Buscar missões disponíveis
    const missoes = await prisma.missao.findMany({
      where: {
        ativa: true
      },
      take: 5
    })
    
    console.log(`📋 Encontradas ${missoes.length} missões ativas`)
    
    if (missoes.length === 0) {
      console.log('❌ Nenhuma missão ativa encontrada')
      return
    }
    
    // Verificar progresso do usuário nas missões
    for (const missao of missoes) {
      console.log(`\n🎯 Missão: ${missao.titulo} (${missao.id})`)
      
      const missaoUsuario = await prisma.missaoUsuario.findFirst({
        where: {
          missaoId: missao.id,
          usuarioId: usuario.id
        }
      })
      
      if (missaoUsuario) {
        console.log(`   Progresso: ${missaoUsuario.progresso}/${missao.objetivo}`)
        console.log(`   Concluída: ${missaoUsuario.concluida}`)
        console.log(`   Reivindicada: ${missaoUsuario.reivindicada}`)
        
        // Se a missão está concluída mas não reivindicada, vamos testar
        if (missaoUsuario.concluida && !missaoUsuario.reivindicada) {
          console.log(`   ✅ Missão pronta para reivindicar!`)
          
          // Simular a reivindicação
          try {
            // Marcar como reivindicada
            await prisma.missaoUsuario.update({
              where: { id: missaoUsuario.id },
              data: { reivindicada: true }
            })
            
            // Atualizar XP
            await prisma.usuario.update({
              where: { id: usuario.id },
              data: {
                xp: usuario.xp + missao.recompensa
              }
            })
            
            // Criar histórico XP
            await prisma.historicoXP.create({
              data: {
                usuarioId: usuario.id,
                quantidade: missao.recompensa,
                tipo: 'missao',
                descricao: `XP ganho por completar a missão: ${missao.titulo}`
              }
            })
            
            // Criar notificação
            const notificacao = await prisma.notificacao.create({
              data: {
                usuarioId: usuario.id,
                tipo: 'missao',
                titulo: 'Missão Completada!',
                mensagem: `Você ganhou ${missao.recompensa} XP por completar a missão "${missao.titulo}"!`,
                lida: false
              }
            })
            
            console.log(`   🎉 Notificação criada: ${notificacao.id}`)
            console.log(`   📝 Título: ${notificacao.titulo}`)
            console.log(`   💬 Mensagem: ${notificacao.mensagem}`)
            
          } catch (error) {
            console.log(`   ❌ Erro ao reivindicar: ${error.message}`)
          }
        }
      } else {
        console.log(`   ❌ Usuário não tem progresso nesta missão`)
      }
    }
    
//   } catch (error) {
//     console.error('❌ Erro:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// testarReivindicarMissao() 
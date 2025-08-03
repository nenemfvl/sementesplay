const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testarDoacaoSimples() {
  try {
    console.log('🧪 Testando doação simples...')
    
    // Buscar usuário e criador
    const usuario = await prisma.usuario.findFirst()
    const criador = await prisma.criador.findFirst()
    
    if (!usuario || !criador) {
      console.log('❌ Usuário ou criador não encontrado')
      return
    }
    
    console.log(`👤 Usuário: ${usuario.nome}`)
    console.log(`🎭 Criador: ${criador.id}`)
    
    // Verificar missões antes
    console.log('\n📋 Verificando missões antes da doação:')
    const missoesAntes = await prisma.missao.findMany({
      where: {
        ativa: true,
        OR: [
          { titulo: { contains: 'Doador' } },
          { titulo: { contains: 'Doação' } }
        ]
      }
    })
    
    console.log(`Encontradas ${missoesAntes.length} missões relacionadas a doações`)
    
    // Verificar progresso atual
    for (const missao of missoesAntes.slice(0, 3)) { // Apenas as primeiras 3
      const progresso = await prisma.missaoUsuario.findFirst({
        where: {
          missaoId: missao.id,
          usuarioId: usuario.id
        }
      })
      
      if (progresso) {
        console.log(`   "${missao.titulo}": ${progresso.progresso}/${missao.objetivo}`)
      } else {
        console.log(`   "${missao.titulo}": 0/${missao.objetivo}`)
      }
    }
    
    // Fazer doação simples
    console.log('\n💸 Fazendo doação...')
    const doacao = await prisma.doacao.create({
      data: {
        doadorId: usuario.id,
        criadorId: criador.id,
        quantidade: 1,
        mensagem: 'Teste simples',
        data: new Date()
      }
    })
    
    console.log(`✅ Doação criada: ${doacao.id}`)
    
    // Atualizar sementes
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { sementes: { decrement: 1 } }
    })
    
    await prisma.usuario.update({
      where: { id: criador.usuarioId },
      data: { sementes: { increment: 1 } }
    })
    
    // Atualizar apenas as primeiras 3 missões para evitar timeout
    console.log('\n🔄 Atualizando missões...')
    for (const missao of missoesAntes.slice(0, 3)) {
      console.log(`\n🎯 Processando: ${missao.titulo}`)
      
      let missaoUsuario = await prisma.missaoUsuario.findFirst({
        where: {
          missaoId: missao.id,
          usuarioId: usuario.id
        }
      })
      
      if (!missaoUsuario) {
        missaoUsuario = await prisma.missaoUsuario.create({
          data: {
            missaoId: missao.id,
            usuarioId: usuario.id,
            progresso: 0,
            concluida: false
          }
        })
      }
      
      const novoProgresso = missaoUsuario.progresso + 1
      const concluida = novoProgresso >= missao.objetivo
      
      console.log(`   Progresso: ${missaoUsuario.progresso} → ${novoProgresso}/${missao.objetivo}`)
      console.log(`   Concluída: ${concluida}`)
      
      await prisma.missaoUsuario.update({
        where: { id: missaoUsuario.id },
        data: {
          progresso: novoProgresso,
          concluida: concluida,
          dataConclusao: concluida && !missaoUsuario.concluida ? new Date() : missaoUsuario.dataConclusao
        }
      })
      
      if (concluida && !missaoUsuario.concluida) {
        console.log(`   🎉 Missão completada!`)
        
        // Criar notificação
        await prisma.notificacao.create({
          data: {
            usuarioId: usuario.id,
            tipo: 'missao',
            titulo: 'Missão Completada!',
            mensagem: `Você completou a missão "${missao.titulo}"!`,
            lida: false
          }
        })
        
        console.log(`   📢 Notificação criada!`)
      }
    }
    
    console.log('\n✅ Teste concluído!')
    
    // Verificar notificações criadas
    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId: usuario.id,
        tipo: 'missao'
      },
      orderBy: { data: 'desc' },
      take: 3
    })
    
    console.log(`\n📢 Notificações criadas: ${notificacoes.length}`)
    for (const notificacao of notificacoes) {
      console.log(`   - ${notificacao.titulo}: ${notificacao.mensagem}`)
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarDoacaoSimples() 
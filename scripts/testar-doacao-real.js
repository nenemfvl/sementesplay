const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testarDoacaoReal() {
  try {
    console.log('🧪 Testando doação real...')
    
    // Buscar usuário e criador para teste
    const usuario = await prisma.usuario.findFirst()
    const criador = await prisma.criador.findFirst()
    
    if (!usuario || !criador) {
      console.log('❌ Usuário ou criador não encontrado')
      return
    }
    
    console.log(`👤 Usuário: ${usuario.nome} (${usuario.id})`)
    console.log(`🎭 Criador: ${criador.id}`)
    console.log(`💰 Sementes do usuário: ${usuario.sementes}`)
    
    // Verificar missões antes da doação
    console.log('\n📋 Missões antes da doação:')
    const missoesAntes = await prisma.missao.findMany({
      where: {
        ativa: true,
        OR: [
          { titulo: { contains: 'Doação' } },
          { titulo: { contains: 'Doador' } },
          { descricao: { contains: 'doação' } }
        ]
      }
    })
    
    console.log(`Encontradas ${missoesAntes.length} missões relacionadas a doações:`)
    for (const missao of missoesAntes) {
      console.log(`   - ${missao.titulo} (${missao.tipo})`)
    }
    
    // Verificar progresso atual
    for (const missao of missoesAntes) {
      const progresso = await prisma.missaoUsuario.findFirst({
        where: {
          missaoId: missao.id,
          usuarioId: usuario.id
        }
      })
      
      if (progresso) {
        console.log(`   Progresso em "${missao.titulo}": ${progresso.progresso}/${missao.objetivo}`)
      } else {
        console.log(`   Progresso em "${missao.titulo}": 0/${missao.objetivo}`)
      }
    }
    
    // Fazer doação
    console.log('\n💸 Fazendo doação...')
    const quantidade = 1
    
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar doação
      const doacao = await tx.doacao.create({
        data: {
          doadorId: usuario.id,
          criadorId: criador.id,
          quantidade: quantidade,
          mensagem: 'Teste de doação',
          data: new Date()
        }
      })
      
      // Deduzir sementes do doador
      await tx.usuario.update({
        where: { id: usuario.id },
        data: { sementes: { decrement: quantidade } }
      })
      
      // Adicionar sementes ao criador
      await tx.usuario.update({
        where: { id: criador.usuarioId },
        data: { sementes: { increment: quantidade } }
      })
      
      // Atualizar contador de doações
      await tx.criador.update({
        where: { id: criador.id },
        data: { doacoes: { increment: 1 } }
      })
      
      // Registrar histórico
      await tx.semente.create({
        data: {
          usuarioId: usuario.id,
          quantidade: -quantidade,
          tipo: 'doacao',
          descricao: `Doação para criador ${criador.id}`
        }
      })
      
      await tx.semente.create({
        data: {
          usuarioId: criador.usuarioId,
          quantidade: quantidade,
          tipo: 'recebida',
          descricao: `Doação recebida de ${usuario.id}`
        }
      })
      
      // Atualizar missões
      console.log('🔄 Atualizando missões...')
      
      // Buscar missões relacionadas a doações
      const missoes = await tx.missao.findMany({
        where: {
          ativa: true,
          OR: [
            { titulo: { contains: 'Doação' } },
            { titulo: { contains: 'Doador' } },
            { descricao: { contains: 'doação' } }
          ]
        }
      })
      
      console.log(`Encontradas ${missoes.length} missões para atualizar`)
      
      for (const missao of missoes) {
        console.log(`\n🎯 Processando missão: ${missao.titulo}`)
        
        // Verificar progresso atual
        let missaoUsuario = await tx.missaoUsuario.findFirst({
          where: {
            missaoId: missao.id,
            usuarioId: usuario.id
          }
        })
        
        if (!missaoUsuario) {
          console.log('   Criando novo progresso...')
          missaoUsuario = await tx.missaoUsuario.create({
            data: {
              missaoId: missao.id,
              usuarioId: usuario.id,
              progresso: 0,
              concluida: false
            }
          })
        }
        
        console.log(`   Progresso atual: ${missaoUsuario.progresso}/${missao.objetivo}`)
        
        // Atualizar progresso
        const novoProgresso = missaoUsuario.progresso + 1
        const concluida = novoProgresso >= missao.objetivo
        
        console.log(`   Novo progresso: ${novoProgresso}/${missao.objetivo}`)
        console.log(`   Concluída: ${concluida}`)
        
        // Atualizar missão
        await tx.missaoUsuario.update({
          where: { id: missaoUsuario.id },
          data: {
            progresso: novoProgresso,
            concluida: concluida,
            dataConclusao: concluida && !missaoUsuario.concluida ? new Date() : missaoUsuario.dataConclusao
          }
        })
        
        console.log(`   ✅ Missão atualizada!`)
        
        if (concluida && !missaoUsuario.concluida) {
          console.log(`   🎉 Missão completada!`)
          
          // Criar notificação
          await tx.notificacao.create({
            data: {
              usuarioId: usuario.id,
              tipo: 'missao',
              titulo: 'Missão Completada!',
              mensagem: `Você completou a missão "${missao.titulo}" e ganhou ${missao.recompensa} XP!`,
              lida: false
            }
          })
          
          console.log(`   📢 Notificação criada!`)
        }
      }
      
      return doacao
    })
    
    console.log('\n✅ Doação realizada com sucesso!')
    console.log(`ID da doação: ${resultado.id}`)
    
    // Verificar progresso após a doação
    console.log('\n📊 Progresso após a doação:')
    for (const missao of missoesAntes) {
      const progresso = await prisma.missaoUsuario.findFirst({
        where: {
          missaoId: missao.id,
          usuarioId: usuario.id
        }
      })
      
      if (progresso) {
        console.log(`   "${missao.titulo}": ${progresso.progresso}/${missao.objetivo} (Concluída: ${progresso.concluida})`)
      }
    }
    
    // Verificar notificações
    console.log('\n📢 Notificações criadas:')
    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId: usuario.id,
        tipo: 'missao'
      },
      orderBy: { data: 'desc' },
      take: 5
    })
    
    for (const notificacao of notificacoes) {
      console.log(`   - ${notificacao.titulo}: ${notificacao.mensagem}`)
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarDoacaoReal() 
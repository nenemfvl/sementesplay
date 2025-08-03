const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarNotificacoesRecentes() {
  try {
    console.log('📢 Verificando notificações recentes...')
    
    // Buscar usuário
    const usuario = await prisma.usuario.findFirst()
    if (!usuario) {
      console.log('❌ Nenhum usuário encontrado')
      return
    }
    
    console.log(`👤 Usuário: ${usuario.nome} (${usuario.id})`)
    
    // Verificar notificações dos últimos 10 minutos
    const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000)
    
    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId: usuario.id,
        data: {
          gte: dezMinutosAtras
        }
      },
      orderBy: { data: 'desc' }
    })
    
    console.log(`\n📋 Encontradas ${notificacoes.length} notificações recentes:`)
    
    for (const notificacao of notificacoes) {
      console.log(`\n   📅 ${notificacao.data}`)
      console.log(`   📝 Tipo: ${notificacao.tipo}`)
      console.log(`   🏷️  Título: ${notificacao.titulo}`)
      console.log(`   💬 Mensagem: ${notificacao.mensagem}`)
      console.log(`   👁️  Lida: ${notificacao.lida}`)
    }
    
    // Verificar todas as notificações do tipo 'missao'
    console.log('\n🎯 Verificando todas as notificações de missão:')
    const notificacoesMissao = await prisma.notificacao.findMany({
      where: {
        usuarioId: usuario.id,
        tipo: 'missao'
      },
      orderBy: { data: 'desc' },
      take: 10
    })
    
    console.log(`Encontradas ${notificacoesMissao.length} notificações de missão:`)
    for (const notificacao of notificacoesMissao) {
      console.log(`   - ${notificacao.titulo}: ${notificacao.mensagem} (${notificacao.data})`)
    }
    
    // Verificar progresso atual das missões
    console.log('\n📊 Progresso atual das missões:')
    const missoes = await prisma.missao.findMany({
      where: {
        ativa: true,
        OR: [
          { titulo: { contains: 'Doação' } },
          { titulo: { contains: 'Doador' } },
          { descricao: { contains: 'doação' } }
        ]
      }
    })
    
    for (const missao of missoes) {
      const progresso = await prisma.missaoUsuario.findFirst({
        where: {
          missaoId: missao.id,
          usuarioId: usuario.id
        }
      })
      
      if (progresso) {
        console.log(`   "${missao.titulo}": ${progresso.progresso}/${missao.objetivo} (Concluída: ${progresso.concluida})`)
      } else {
        console.log(`   "${missao.titulo}": 0/${missao.objetivo} (Concluída: false)`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarNotificacoesRecentes() 
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarNotificacoesUsuario() {
  try {
    console.log('🔍 Verificando notificações de usuários específicos...')
    
    // Buscar usuários
    const usuarios = await prisma.usuario.findMany({
      take: 3,
      orderBy: {
        dataCriacao: 'desc'
      }
    })
    
    console.log(`👥 Encontrados ${usuarios.length} usuários`)
    
    for (const usuario of usuarios) {
      console.log(`\n📋 Verificando notificações para: ${usuario.nome} (${usuario.id})`)
      
      const notificacoes = await prisma.notificacao.findMany({
        where: {
          usuarioId: usuario.id
        },
        orderBy: {
          data: 'desc'
        }
      })
      
      console.log(`   📊 Total de notificações: ${notificacoes.length}`)
      
      if (notificacoes.length > 0) {
        console.log('   📋 Últimas 3 notificações:')
        notificacoes.slice(0, 3).forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.titulo} (${notif.tipo}) - ${notif.lida ? 'Lida' : 'Não lida'}`)
        })
      } else {
        console.log('   ❌ Nenhuma notificação encontrada')
      }
    }
    
    // Verificar se há notificações de missões
    console.log('\n🎯 Verificando notificações de missões...')
    const notificacoesMissoes = await prisma.notificacao.findMany({
      where: {
        tipo: 'missao'
      },
      orderBy: {
        data: 'desc'
      }
    })
    
    console.log(`📊 Total de notificações de missões: ${notificacoesMissoes.length}`)
    
    if (notificacoesMissoes.length > 0) {
      console.log('📋 Últimas notificações de missões:')
      notificacoesMissoes.slice(0, 3).forEach((notif, index) => {
        console.log(`${index + 1}. Usuário: ${notif.usuarioId}`)
        console.log(`   Título: ${notif.titulo}`)
        console.log(`   Mensagem: ${notif.mensagem}`)
        console.log(`   Data: ${notif.data}`)
        console.log('---')
      })
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarNotificacoesUsuario() 
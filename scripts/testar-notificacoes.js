const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testarNotificacoes() {
  try {
    console.log('🔍 Verificando notificações no banco de dados...')
    
    // Buscar todas as notificações
    const todasNotificacoes = await prisma.notificacao.findMany({
      orderBy: {
        data: 'desc'
      }
    })
    
    console.log(`📊 Total de notificações no banco: ${todasNotificacoes.length}`)
    
    if (todasNotificacoes.length > 0) {
      console.log('\n📋 Últimas 5 notificações:')
      todasNotificacoes.slice(0, 5).forEach((notif, index) => {
        console.log(`${index + 1}. ID: ${notif.id}`)
        console.log(`   Usuário: ${notif.usuarioId}`)
        console.log(`   Tipo: ${notif.tipo}`)
        console.log(`   Título: ${notif.titulo}`)
        console.log(`   Mensagem: ${notif.mensagem}`)
        console.log(`   Lida: ${notif.lida}`)
        console.log(`   Data: ${notif.data}`)
        console.log('---')
      })
    } else {
      console.log('❌ Nenhuma notificação encontrada no banco!')
    }
    
    // Verificar usuários
    const usuarios = await prisma.usuario.findMany({
      take: 5,
      orderBy: {
        dataCriacao: 'desc'
      }
    })
    
    console.log(`\n👥 Total de usuários: ${usuarios.length}`)
    if (usuarios.length > 0) {
      console.log('Últimos usuários:')
      usuarios.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nome} (${user.id})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar notificações:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarNotificacoes() 
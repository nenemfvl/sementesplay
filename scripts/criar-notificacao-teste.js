const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function criarNotificacaoTeste() {
  try {
    console.log('📢 Criando notificação de teste...')
    
    // Buscar usuário
    const usuario = await prisma.usuario.findFirst()
    if (!usuario) {
      console.log('❌ Nenhum usuário encontrado')
      return
    }
    
    console.log(`👤 Usuário: ${usuario.nome} (${usuario.id})`)
    
    // Criar notificação
    const notificacao = await prisma.notificacao.create({
      data: {
        usuarioId: usuario.id,
        tipo: 'missao',
        titulo: 'Missão Completada!',
        mensagem: 'Você completou a missão "Doador Diário" e ganhou 25 XP!',
        lida: false
      }
    })
    
    console.log('✅ Notificação criada com sucesso!')
    console.log(`   ID: ${notificacao.id}`)
    console.log(`   Título: ${notificacao.titulo}`)
    console.log(`   Mensagem: ${notificacao.mensagem}`)
    console.log(`   Data: ${notificacao.data}`)
    
    // Verificar se foi criada
    const notificacaoCriada = await prisma.notificacao.findUnique({
      where: { id: notificacao.id }
    })
    
    if (notificacaoCriada) {
      console.log('✅ Notificação encontrada no banco!')
    } else {
      console.log('❌ Notificação não encontrada no banco!')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

criarNotificacaoTeste() 
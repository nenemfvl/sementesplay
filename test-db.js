const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('Conectando ao banco...')
    
    // Testar conexão
    await prisma.$connect()
    console.log('✅ Conectado ao banco com sucesso!')
    
    // Verificar tabelas
    const usuarios = await prisma.usuario.findMany({
      take: 5,
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true
      }
    })
    
    console.log('\n📊 Usuários encontrados:', usuarios.length)
    if (usuarios.length > 0) {
      console.log('Primeiros usuários:', usuarios)
    }
    
    const criadores = await prisma.criador.findMany({
      take: 5,
      select: {
        id: true,
        nome: true,
        categoria: true,
        redesSociais: true
      }
    })
    
    console.log('\n🎯 Criadores encontrados:', criadores.length)
    if (criadores.length > 0) {
      console.log('Primeiros criadores:', criadores)
    }
    
    // Verificar estrutura da tabela criador
    console.log('\n🔍 Estrutura da tabela criador:')
    const criadorSample = await prisma.criador.findFirst()
    if (criadorSample) {
      console.log('Campos disponíveis:', Object.keys(criadorSample))
      console.log('Redes sociais (raw):', criadorSample.redesSociais)
      try {
        const redes = JSON.parse(criadorSample.redesSociais)
        console.log('Redes sociais (parsed):', redes)
      } catch (e) {
        console.log('Erro ao fazer parse das redes sociais:', e.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()

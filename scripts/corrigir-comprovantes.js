const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function corrigirComprovantes() {
  try {
    console.log('🔍 Verificando comprovantes antigos...')
    
    // Buscar todas as compras com comprovanteUrl
    const compras = await prisma.compraParceiro.findMany({
      where: {
        comprovanteUrl: {
          not: null
        }
      },
      select: {
        id: true,
        comprovanteUrl: true
      }
    })
    
    console.log(`📊 Encontradas ${compras.length} compras com comprovante`)
    
    // Verificar URLs inválidas
    const urlsInvalidas = compras.filter(compra => {
      const url = compra.comprovanteUrl
      return url && (url.startsWith('blob:') || url.startsWith('data:') || !url.startsWith('http'))
    })
    
    console.log(`❌ Encontradas ${urlsInvalidas.length} URLs inválidas`)
    
    // Limpar URLs inválidas
    for (const compra of urlsInvalidas) {
      console.log(`🧹 Limpando URL inválida: ${compra.comprovanteUrl}`)
      await prisma.compraParceiro.update({
        where: { id: compra.id },
        data: { comprovanteUrl: null }
      })
    }
    
    // Buscar repasses com comprovanteUrl
    const repasses = await prisma.repasseParceiro.findMany({
      where: {
        comprovanteUrl: {
          not: null
        }
      },
      select: {
        id: true,
        comprovanteUrl: true
      }
    })
    
    console.log(`📊 Encontrados ${repasses.length} repasses com comprovante`)
    
    // Verificar URLs inválidas nos repasses
    const repassesUrlsInvalidas = repasses.filter(repasse => {
      const url = repasse.comprovanteUrl
      return url && (url.startsWith('blob:') || url.startsWith('data:') || !url.startsWith('http'))
    })
    
    console.log(`❌ Encontradas ${repassesUrlsInvalidas.length} URLs inválidas nos repasses`)
    
    // Limpar URLs inválidas nos repasses
    for (const repasse of repassesUrlsInvalidas) {
      console.log(`🧹 Limpando URL inválida no repasse: ${repasse.comprovanteUrl}`)
      await prisma.repasseParceiro.update({
        where: { id: repasse.id },
        data: { comprovanteUrl: null }
      })
    }
    
    console.log('✅ Limpeza concluída!')
    console.log(`📝 URLs inválidas removidas: ${urlsInvalidas.length + repassesUrlsInvalidas.length}`)
    
  } catch (error) {
    console.error('❌ Erro ao corrigir comprovantes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

corrigirComprovantes() 
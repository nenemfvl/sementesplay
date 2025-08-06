// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function addCodes() {
  try {
    // Buscar o primeiro parceiro
    const parceiro = await prisma.parceiro.findFirst()
    
    if (!parceiro) {
      console.log('❌ Nenhum parceiro encontrado! Execute o seed primeiro.')
      return
    }

    // Adicionar códigos de cashback
    const codes = [
      { codigo: 'WELCOME50', valor: 50 },
      { codigo: 'BONUS100', valor: 100 },
      { codigo: 'EXTRA200', valor: 200 },
      { codigo: 'GIFT500', valor: 500 }
    ]

    for (const code of codes) {
      // Verificar se o código já existe
      const existing = await prisma.codigoCashback.findUnique({
        where: { codigo: code.codigo }
      })

      if (!existing) {
        await prisma.codigoCashback.create({
          data: {
            parceiroId: parceiro.id,
            codigo: code.codigo,
            valor: code.valor,
            usado: false
          }
        })
        console.log(`✅ Código ${code.codigo} adicionado!`)
      } else {
        console.log(`⚠️ Código ${code.codigo} já existe!`)
      }
    }

    console.log('🎉 Códigos de cashback adicionados com sucesso!')
    console.log('💳 Códigos disponíveis: WELCOME50, BONUS100, EXTRA200, GIFT500')
//   } catch (error) {
//     console.error('❌ Erro:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// addCodes() 
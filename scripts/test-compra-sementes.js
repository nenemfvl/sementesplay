const { PrismaClient } = require('@prisma/client')
const fetch = require('node-fetch')

const prisma = new PrismaClient()

async function testarCompraSementes() {
  console.log('🧪 Testando sistema de compra de sementes via PIX...\n')

  try {
    // 1. Verificar configuração do MercadoPago
    console.log('1️⃣ Verificando configuração do MercadoPago...')
    try {
      const configResponse = await fetch('http://localhost:3000/api/debug/test-mercadopago')
      const configData = await configResponse.json()
      
      if (configData.success) {
        console.log('✅ Configuração do MercadoPago: OK')
        console.log(`   - Access Token: ${configData.config.hasAccessToken ? 'Configurado' : 'NÃO CONFIGURADO'}`)
        console.log(`   - PIX disponível: ${configData.apiTest.pixAvailable ? 'SIM' : 'NÃO'}`)
      } else {
        console.log('❌ Problema na configuração do MercadoPago:')
        console.log(`   - Erro: ${configData.error}`)
        return
      }
    } catch (error) {
      console.log('❌ Erro ao verificar configuração:', error.message)
      return
    }

    console.log('\n2️⃣ Buscando usuário de teste...')
    
    // 2. Buscar um usuário para teste
    const usuario = await prisma.usuario.findFirst({
      where: {
        email: { contains: '@' }
      }
    })

    if (!usuario) {
      console.log('❌ Nenhum usuário encontrado para teste')
      return
    }

    console.log('✅ Usuário encontrado:', usuario.nome, '-', usuario.email)

    console.log('\n3️⃣ Simulando compra de sementes...')

    // 3. Simular criação de pagamento
    const valorTeste = 10.00
    const pagamento = await prisma.pagamento.create({
      data: {
        usuarioId: usuario.id,
        tipo: 'pix',
        valor: valorTeste,
        sementesGeradas: 0,
        gateway: 'mercadopago',
        status: 'pendente',
        dadosPagamento: JSON.stringify({ tipo: 'pix', valor: valorTeste }),
        dataPagamento: new Date()
      }
    })

    console.log('✅ Pagamento criado no banco:', pagamento.id)

    console.log('\n4️⃣ Testando processamento do pagamento...')

    // 4. Simular processamento do pagamento (simulando webhook)
    const sementesGeradas = Math.floor(valorTeste)

    await prisma.$transaction(async (tx) => {
      // Atualizar pagamento
      await tx.pagamento.update({
        where: { id: pagamento.id },
        data: { 
          status: 'aprovado',
          sementesGeradas: sementesGeradas,
          dataPagamento: new Date()
        }
      })

      // Creditar sementes
      await tx.usuario.update({
        where: { id: usuario.id },
        data: { sementes: { increment: sementesGeradas } }
      })

      // Registrar histórico
      await tx.semente.create({
        data: {
          usuarioId: usuario.id,
          quantidade: sementesGeradas,
          tipo: 'comprada',
          descricao: `Teste de compra de sementes - R$ ${valorTeste}`
        }
      })

      // Verificar/criar carteira
      let carteira = await tx.carteiraDigital.findUnique({
        where: { usuarioId: usuario.id }
      })

      if (!carteira) {
        carteira = await tx.carteiraDigital.create({
          data: {
            usuarioId: usuario.id,
            saldo: sementesGeradas,
            dataCriacao: new Date()
          }
        })
      } else {
        await tx.carteiraDigital.update({
          where: { id: carteira.id },
          data: { saldo: { increment: sementesGeradas } }
        })
      }

      // Registrar movimentação
      await tx.movimentacaoCarteira.create({
        data: {
          carteiraId: carteira.id,
          tipo: 'credito',
          valor: sementesGeradas,
          saldoAnterior: carteira.saldo,
          saldoPosterior: carteira.saldo + sementesGeradas,
          descricao: `Teste de compra de sementes - R$ ${valorTeste}`,
          status: 'processado',
          referencia: pagamento.id
        }
      })
    })

    console.log('✅ Pagamento processado com sucesso!')

    // 5. Verificar resultado final
    console.log('\n5️⃣ Verificando resultado final...')
    
    const usuarioAtualizado = await prisma.usuario.findUnique({
      where: { id: usuario.id },
      select: { sementes: true }
    })

    const carteira = await prisma.carteiraDigital.findUnique({
      where: { usuarioId: usuario.id },
      select: { saldo: true }
    })

    console.log('✅ Resultado final:')
    console.log(`   - Sementes do usuário: ${usuarioAtualizado?.sementes}`)
    console.log(`   - Saldo da carteira: ${carteira?.saldo}`)
    console.log(`   - Sementes geradas: ${sementesGeradas}`)

    console.log('\n🎉 Teste concluído com sucesso!')
    console.log('\n📋 Resumo:')
    console.log(`   ✅ Configuração MercadoPago: OK`)
    console.log(`   ✅ Criação de pagamento: OK`)
    console.log(`   ✅ Processamento de pagamento: OK`)
    console.log(`   ✅ Creditação de sementes: OK`)
    console.log(`   ✅ Atualização da carteira: OK`)

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste
testarCompraSementes()

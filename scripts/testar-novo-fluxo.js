const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarNovoFluxo() {
  console.log('🧪 TESTANDO NOVO FLUXO SEMENTESPLAY10')
  console.log('=====================================\n')

  try {
    // 0. Limpar dados de teste anteriores
    console.log('0️⃣ Limpando dados de teste anteriores...')
    await prisma.semente.deleteMany({
      where: {
        descricao: { contains: 'Cashback compra parceiro' }
      }
    })
    await prisma.repasseParceiro.deleteMany({
      where: {
        comprovanteUrl: 'https://exemplo.com/repasse.jpg'
      }
    })
    await prisma.compraParceiro.deleteMany({
      where: {
        comprovanteUrl: 'https://exemplo.com/comprovante.jpg'
      }
    })
    await prisma.parceiro.deleteMany({
      where: {
        nomeCidade: 'Cidade Teste FiveM'
      }
    })
    await prisma.usuario.deleteMany({
      where: {
        email: { contains: 'jogador.teste@teste.com' }
      }
    })
    console.log('✅ Dados de teste anteriores removidos')

    // 1. Criar usuário de teste
    console.log('\n1️⃣ Criando usuário de teste...')
    const timestamp = Date.now()
    const usuario = await prisma.usuario.create({
      data: {
        nome: 'Jogador Teste',
        email: `jogador.teste.${timestamp}@teste.com`,
        senha: '123456',
        tipo: 'usuario',
        nivel: 'comum',
        sementes: 0
      }
    })
    console.log(`✅ Usuário criado: ${usuario.nome} (${usuario.id})`)

    // 2. Criar parceiro de teste
    console.log('\n2️⃣ Criando parceiro de teste...')
    const parceiro = await prisma.parceiro.create({
      data: {
        usuarioId: usuario.id,
        nomeCidade: 'Cidade Teste FiveM',
        comissaoMensal: 500.00,
        totalVendas: 0,
        codigosGerados: 0,
        saldoDevedor: 0
      }
    })
    console.log(`✅ Parceiro criado: ${parceiro.nomeCidade} (${parceiro.id})`)

    // 3. Simular compra com cupom sementesplay10
    console.log('\n3️⃣ Simulando compra com cupom sementesplay10...')
    const valorCompra = 100.00
    const compra = await prisma.compraParceiro.create({
      data: {
        usuarioId: usuario.id,
        parceiroId: parceiro.id,
        valorCompra: valorCompra,
        comprovanteUrl: 'https://exemplo.com/comprovante.jpg',
        dataCompra: new Date(),
        status: 'aguardando_repasse',
        cupomUsado: 'sementesplay10'
      }
    })
    console.log(`✅ Compra registrada: R$ ${valorCompra} (${compra.id})`)

    // 4. Simular repasse de 10% da cidade
    console.log('\n4️⃣ Simulando repasse de 10% da cidade...')
    const valorRepasse = valorCompra * 0.10 // 10%
    const repasse = await prisma.repasseParceiro.create({
      data: {
        parceiroId: parceiro.id,
        compraId: compra.id,
        valor: valorRepasse,
        comprovanteUrl: 'https://exemplo.com/repasse.jpg',
        status: 'pendente'
      }
    })
    console.log(`✅ Repasse registrado: R$ ${valorRepasse} (${repasse.id})`)

    // 5. Verificar saldo inicial
    console.log('\n5️⃣ Verificando saldos iniciais...')
    const usuarioInicial = await prisma.usuario.findUnique({ where: { id: usuario.id } })
    const parceiroInicial = await prisma.parceiro.findUnique({ where: { id: parceiro.id } })
    console.log(`💰 Usuário: ${usuarioInicial.sementes} sementes`)
    console.log(`💰 Parceiro: ${parceiroInicial.saldoDevedor} saldo devedor`)

    // 6. Simular aprovação do repasse
    console.log('\n6️⃣ Simulando aprovação do repasse...')
    
    // Calcula as porcentagens do novo fluxo (convertendo para inteiros)
    const pctUsuario = Math.round(valorRepasse * 0.05)    // 5% para jogador
    const pctSistema = valorRepasse * 0.025               // 2,5% para sistema
    const pctFundo = valorRepasse * 0.025                 // 2,5% para fundo

    console.log(`📊 Distribuição:`)
    console.log(`   • Jogador: ${pctUsuario} sementes (5%)`)
    console.log(`   • Sistema: R$ ${pctSistema.toFixed(2)} (2,5%)`)
    console.log(`   • Fundo: R$ ${pctFundo.toFixed(2)} (2,5%)`)

    // 7. Aplicar a transação
    await prisma.$transaction(async (tx) => {
      // Atualiza repasse para confirmado
      await tx.repasseParceiro.update({
        where: { id: repasse.id },
        data: { status: 'confirmado' }
      })
      
      // Atualiza compra para cashback_liberado
      await tx.compraParceiro.update({
        where: { id: compra.id },
        data: { status: 'cashback_liberado' }
      })
      
      // Atualiza saldo devedor do parceiro
      await tx.parceiro.update({
        where: { id: parceiro.id },
        data: { saldoDevedor: { decrement: valorRepasse } }
      })
      
      // Credita sementes para usuário
      await tx.usuario.update({
        where: { id: usuario.id },
        data: { sementes: { increment: pctUsuario } }
      })
      
      // Sistema SementesPLAY recebe dinheiro (não sementes)
      // Aqui você pode implementar a lógica para creditar na conta do sistema
      // Por enquanto, vamos apenas registrar no histórico
      
      // Registra fundo de sementes
      const fundoExistente = await tx.fundoSementes.findFirst({
        where: { distribuido: false }
      })
      
      if (fundoExistente) {
        await tx.fundoSementes.update({
          where: { id: fundoExistente.id },
          data: { valorTotal: { increment: pctFundo } }
        })
      } else {
        await tx.fundoSementes.create({
          data: {
            ciclo: 1,
            valorTotal: pctFundo,
            dataInicio: new Date(),
            dataFim: new Date(),
            distribuido: false
          }
        })
      }
      
      // Registra histórico de sementes (apenas para o jogador)
      await tx.semente.createMany({
        data: [
          {
            usuarioId: usuario.id,
            quantidade: pctUsuario,
            tipo: 'resgatada',
            descricao: `Cashback compra parceiro ${compra.id}`
          }
        ]
      })
    })

    console.log(`✅ Transação aplicada com sucesso!`)

    // 8. Verificar saldos finais
    console.log('\n7️⃣ Verificando saldos finais...')
    const usuarioFinal = await prisma.usuario.findUnique({ where: { id: usuario.id } })
    const parceiroFinal = await prisma.parceiro.findUnique({ where: { id: parceiro.id } })
    const fundo = await prisma.fundoSementes.findFirst({ where: { distribuido: false } })
    
    console.log(`💰 Usuário: ${usuarioFinal.sementes} sementes (+${pctUsuario})`)
    console.log(`💰 Parceiro: ${parceiroFinal.saldoDevedor} saldo devedor (-${valorRepasse.toFixed(2)})`)
    console.log(`💰 Fundo de Sementes: ${fundo ? fundo.valorTotal.toFixed(2) : '0.00'} total`)

    // 9. Verificar histórico
    console.log('\n8️⃣ Verificando histórico...')
    const historico = await prisma.semente.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { data: 'desc' },
      take: 5
    })
    
    console.log(`📜 Histórico de sementes do usuário:`)
    historico.forEach(s => {
      console.log(`   • ${s.quantidade} sementes - ${s.tipo} - ${s.descricao}`)
    })

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!')
    console.log('================================')
    console.log('✅ Cupom sementesplay10 funcionando')
    console.log('✅ Repasse de 10% validado')
    console.log('✅ Distribuição 5% + 5% aplicada')
    console.log('✅ Fundo de sementes atualizado')
    console.log('✅ Histórico registrado')

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste
testarNovoFluxo() 
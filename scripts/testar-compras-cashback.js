// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function testarComprasCashback() {
  try {
    console.log('🔍 Verificando dados de compras e cashback...')

    // Verificar se existem usuários
    const usuarios = await prisma.usuario.findMany({
      take: 5,
      select: { id: true, nome: true, email: true }
    })

    console.log(`📊 Usuários encontrados: ${usuarios.length}`)
    usuarios.forEach(u => console.log(`  - ${u.nome} (${u.email})`))

    if (usuarios.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Crie usuários primeiro.')
      return
    }

    // Verificar se existem parceiros
    const parceiros = await prisma.parceiro.findMany({
      take: 5,
      select: { id: true, nomeCidade: true }
    })

    console.log(`🏢 Parceiros encontrados: ${parceiros.length}`)
    parceiros.forEach(p => console.log(`  - ${p.nomeCidade}`))

    if (parceiros.length === 0) {
      console.log('❌ Nenhum parceiro encontrado. Crie parceiros primeiro.')
      return
    }

    // Verificar compras existentes
    const compras = await prisma.compraParceiro.findMany({
      include: {
        usuario: { select: { nome: true } },
        parceiro: { select: { nomeCidade: true } }
      }
    })

    console.log(`🛒 Compras encontradas: ${compras.length}`)
    compras.forEach(c => {
      console.log(`  - ${c.usuario.nome} → ${c.parceiro.nomeCidade}: R$ ${c.valorCompra} (${c.status})`)
    })

    // Verificar códigos de cashback
    const codigos = await prisma.codigoCashback.findMany({
      include: {
        parceiro: { select: { nomeCidade: true } }
      }
    })

    console.log(`🎁 Códigos de cashback encontrados: ${codigos.length}`)
    codigos.forEach(c => {
      console.log(`  - ${c.codigo}: ${c.valor} Sementes (${c.usado ? 'Usado' : 'Disponível'}) - ${c.parceiro.nomeCidade}`)
    })

    // Se não há compras, criar algumas de teste
    if (compras.length === 0) {
      console.log('\n📝 Criando compras de teste...')
      
      const usuario = usuarios[0]
      const parceiro = parceiros[0]

      // Criar compra pendente
      const compra1 = await prisma.compraParceiro.create({
        data: {
          usuarioId: usuario.id,
          parceiroId: parceiro.id,
          valorCompra: 100.00,
          dataCompra: new Date(),
          status: 'aguardando_repasse',
          cupomUsado: 'sementesplay10',
          comprovanteUrl: 'https://exemplo.com/comprovante1.jpg'
        }
      })

      // Criar compra com repasse pendente
      const compra2 = await prisma.compraParceiro.create({
        data: {
          usuarioId: usuario.id,
          parceiroId: parceiro.id,
          valorCompra: 250.00,
          dataCompra: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
          status: 'repasse_pendente',
          cupomUsado: 'sementesplay10',
          comprovanteUrl: 'https://exemplo.com/comprovante2.jpg'
        }
      })

      // Criar repasse para a segunda compra
      await prisma.repasseParceiro.create({
        data: {
          parceiroId: parceiro.id,
          compraId: compra2.id,
          valor: 25.00, // 10% de 250
          status: 'pendente',
          usuarioId: usuario.id
        }
      })

      console.log('✅ Compras de teste criadas:')
      console.log(`  - Compra 1: R$ 100,00 (aguardando_repasse)`)
      console.log(`  - Compra 2: R$ 250,00 (repasse_pendente)`)
    }

    // Se não há códigos de cashback, criar alguns
    if (codigos.length === 0) {
      console.log('\n🎁 Criando códigos de cashback de teste...')
      
      const parceiro = parceiros[0]

      // Código disponível
      await prisma.codigoCashback.create({
        data: {
          parceiroId: parceiro.id,
          codigo: 'TESTE50',
          valor: 50,
          usado: false,
          dataGeracao: new Date()
        }
      })

      // Código usado
      await prisma.codigoCashback.create({
        data: {
          parceiroId: parceiro.id,
          codigo: 'USADO100',
          valor: 100,
          usado: true,
          dataGeracao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          dataUso: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      })

      console.log('✅ Códigos de teste criados:')
      console.log(`  - TESTE50: 50 Sementes (disponível)`)
      console.log(`  - USADO100: 100 Sementes (usado)`)
    }

    console.log('\n🎯 Teste concluído! Agora você pode testar a página de cashback.')

//   } catch (error) {
//     console.error('❌ Erro durante o teste:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// testarComprasCashback() 
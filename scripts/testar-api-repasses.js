const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarApiRepasses() {
  try {
    console.log('🧪 Testando API de repasses pendentes...\n')

    const usuarioId = 'cmdqhi5ft0000jo04981xsxry' // vanvan

    // Buscar o parceiro
    const parceiro = await prisma.parceiro.findUnique({
      where: { usuarioId: usuarioId }
    })

    console.log(`🏢 Parceiro encontrado: ${parceiro ? parceiro.nomeCidade : 'NÃO'}`)
    if (parceiro) {
      console.log(`  - ID: ${parceiro.id}`)
      console.log(`  - UsuarioId: ${parceiro.usuarioId}`)
    }

    // Buscar compras aguardando repasse
    const comprasAguardandoRepasse = await prisma.compraParceiro.findMany({
      where: {
        parceiroId: parceiro.id,
        status: {
          in: ['aguardando_repasse', 'repasse_pendente']
        }
      },
      include: {
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })

    console.log(`\n🛒 Compras aguardando repasse: ${comprasAguardandoRepasse.length}`)
    comprasAguardandoRepasse.forEach(compra => {
      console.log(`  - ${compra.usuario.nome}: R$ ${compra.valorCompra} (${compra.status})`)
    })

    // Buscar repasses pendentes
    const repassesPendentes = await prisma.repasseParceiro.findMany({
      where: {
        parceiroId: parceiro.id,
        status: 'pendente'
      },
      include: {
        compra: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        dataRepasse: 'desc'
      }
    })

    console.log(`\n💰 Repasses pendentes: ${repassesPendentes.length}`)
    repassesPendentes.forEach(repasse => {
      console.log(`  - ${repasse.compra.usuario.nome}: R$ ${repasse.valor} (${repasse.status})`)
    })

    // Simular a resposta da API
    const repassesFormatados = [
      // Compras aguardando repasse
      ...comprasAguardandoRepasse.map(compra => ({
        id: compra.id,
        valorCompra: compra.valorCompra,
        valorRepasse: compra.valorCompra * 0.10,
        status: 'aguardando_repasse',
        dataCompra: compra.dataCompra,
        dataRepasse: null,
        comprovante: null,
        usuario: compra.usuario,
        tipo: 'compra'
      })),
      // Repasses pendentes
      ...repassesPendentes.map(repasse => ({
        id: repasse.id,
        valorCompra: repasse.compra.valorCompra,
        valorRepasse: repasse.valor,
        status: 'repasse_pendente',
        dataCompra: repasse.compra.dataCompra,
        dataRepasse: repasse.dataRepasse,
        comprovante: repasse.comprovanteUrl,
        usuario: repasse.compra.usuario,
        tipo: 'repasse'
      }))
    ]

    console.log(`\n📊 Total de repasses formatados: ${repassesFormatados.length}`)
    repassesFormatados.forEach(item => {
      console.log(`  - ${item.usuario.nome}: R$ ${item.valorCompra} → R$ ${item.valorRepasse} (${item.status})`)
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarApiRepasses() 
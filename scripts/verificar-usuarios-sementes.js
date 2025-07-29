const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarUsuariosSementes() {
  console.log('🔍 Verificando usuários com sementes...')

  try {
    // Buscar usuários com sementes
    const usuariosComSementes = await prisma.usuario.findMany({
      where: {
        sementes: {
          gt: 0
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        sementes: true,
        dataCriacao: true,
        nivel: true,
        criador: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        sementes: 'desc'
      }
    })

    console.log(`\n📊 Usuários com sementes: ${usuariosComSementes.length}`)
    console.log('='.repeat(80))

    for (const usuario of usuariosComSementes) {
      console.log(`\n👤 ${usuario.nome} (${usuario.email})`)
      console.log(`   ID: ${usuario.id}`)
      console.log(`   Sementes: ${usuario.sementes}`)
      console.log(`   Nível: ${usuario.nivel}`)
      console.log(`   Data criação: ${usuario.dataCriacao.toLocaleDateString('pt-BR')}`)
      
      if (usuario.criador) {
        console.log(`   Criador: ${usuario.criador.nome} (ID: ${usuario.criador.id})`)
      }

      // Verificar histórico de sementes deste usuário
      const historico = await prisma.semente.findMany({
        where: {
          usuarioId: usuario.id
        },
        orderBy: {
          data: 'desc'
        }
      })

      if (historico.length > 0) {
        console.log(`   📋 Histórico (${historico.length} registros):`)
        historico.forEach(reg => {
          console.log(`      ${reg.data.toLocaleDateString('pt-BR')} - ${reg.tipo}: ${reg.quantidade} (${reg.descricao})`)
        })
      } else {
        console.log(`   ⚠️  SEM HISTÓRICO DE SEMENTES!`)
      }

      // Verificar doações feitas
      const doacoesFeitas = await prisma.doacao.findMany({
        where: {
          doadorId: usuario.id
        }
      })

      if (doacoesFeitas.length > 0) {
        console.log(`   💝 Doações feitas: ${doacoesFeitas.length}`)
        doacoesFeitas.forEach(doacao => {
          console.log(`      ${doacao.data.toLocaleDateString('pt-BR')} - ${doacao.quantidade} sementes para criador ${doacao.criadorId}`)
        })
      }

      // Verificar pagamentos
      const pagamentos = await prisma.pagamento.findMany({
        where: {
          usuarioId: usuario.id
        }
      })

      if (pagamentos.length > 0) {
        console.log(`   💳 Pagamentos: ${pagamentos.length}`)
        pagamentos.forEach(pag => {
          console.log(`      ${pag.dataPagamento.toLocaleDateString('pt-BR')} - R$ ${pag.valor} = ${pag.sementesGeradas} sementes`)
        })
      }

      console.log('   ' + '-'.repeat(60))
    }

    console.log('\n🎯 CONCLUSÃO:')
    if (usuariosComSementes.length === 0) {
      console.log('   Nenhum usuário tem sementes.')
    } else {
      console.log(`   ${usuariosComSementes.length} usuário(s) com sementes sem histórico adequado.`)
      console.log('   Recomenda-se investigar a origem dessas sementes.')
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarUsuariosSementes()
    .then(() => {
      console.log('\n✅ Verificação concluída!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro ao executar verificação:', error)
      process.exit(1)
    })
}

module.exports = { verificarUsuariosSementes } 
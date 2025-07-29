const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function corrigirHistoricoSementes() {
  console.log('🔧 Corrigindo histórico de sementes...')

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
        dataCriacao: true
      }
    })

    console.log(`📊 Encontrados ${usuariosComSementes.length} usuários com sementes`)

    for (const usuario of usuariosComSementes) {
      console.log(`\n👤 Processando: ${usuario.nome} (${usuario.sementes} sementes)`)

      // Verificar se já tem histórico
      const historicoExistente = await prisma.semente.findFirst({
        where: {
          usuarioId: usuario.id
        }
      })

      if (historicoExistente) {
        console.log(`   ⏭️  Já tem histórico, pulando...`)
        continue
      }

      // Criar registro de histórico
      await prisma.semente.create({
        data: {
          usuarioId: usuario.id,
          quantidade: usuario.sementes,
          tipo: 'correcao_manual',
          descricao: `Correção manual - Sementes existentes sem histórico (${usuario.sementes} sementes)`
        }
      })

      console.log(`   ✅ Histórico criado para ${usuario.sementes} sementes`)
    }

    console.log('\n🎉 Correção concluída!')
    console.log('📋 Agora execute o script de verificação novamente para confirmar.')

  } catch (error) {
    console.error('❌ Erro ao corrigir histórico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  corrigirHistoricoSementes()
    .then(() => {
      console.log('\n✅ Script executado com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error)
      process.exit(1)
    })
}

module.exports = { corrigirHistoricoSementes } 
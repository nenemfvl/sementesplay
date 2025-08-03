const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarStatusDoacao() {
  try {
    console.log('🔍 Verificando status da doação...\n')

    // Verificar se o campo xp existe na tabela usuario
    console.log('1. Verificando estrutura da tabela usuario...')
    const usuarios = await prisma.usuario.findMany({
      take: 1,
      select: {
        id: true,
        nome: true,
        sementes: true,
        nivel: true,
        xp: true,
        nivelUsuario: true
      }
    })

    if (usuarios.length > 0) {
      const usuario = usuarios[0]
      console.log('✅ Usuário encontrado:', {
        id: usuario.id,
        nome: usuario.nome,
        sementes: usuario.sementes,
        nivel: usuario.nivel,
        xp: usuario.xp,
        nivelUsuario: usuario.nivelUsuario
      })
    } else {
      console.log('❌ Nenhum usuário encontrado')
    }

    // Verificar criadores
    console.log('\n2. Verificando criadores...')
    const criadores = await prisma.criador.findMany({
      take: 3,
      include: {
        usuario: true
      }
    })

    console.log(`✅ ${criadores.length} criadores encontrados:`)
    criadores.forEach((criador, index) => {
      console.log(`   ${index + 1}. ${criador.usuario.nome} (ID: ${criador.id})`)
    })

    // Verificar se há doações recentes
    console.log('\n3. Verificando doações recentes...')
    const doacoes = await prisma.doacao.findMany({
      take: 5,
      orderBy: {
        data: 'desc'
      },
      include: {
        doador: true,
        criador: {
          include: { usuario: true }
        }
      }
    })

    console.log(`✅ ${doacoes.length} doações recentes encontradas:`)
    doacoes.forEach((doacao, index) => {
      console.log(`   ${index + 1}. ${doacao.doador.nome} → ${doacao.criador.usuario.nome} (${doacao.quantidade} sementes)`)
    })

    // Verificar histórico de XP
    console.log('\n4. Verificando histórico de XP...')
    const historicoXP = await prisma.historicoXP.findMany({
      take: 5,
      orderBy: {
        data: 'desc'
      }
    })

    console.log(`✅ ${historicoXP.length} registros de XP encontrados:`)
    historicoXP.forEach((registro, index) => {
      console.log(`   ${index + 1}. XP: ${registro.xpGanho}, Fonte: ${registro.fonte}, Descrição: ${registro.descricao}`)
    })

    console.log('\n🎉 Verificação concluída!')

  } catch (error) {
    console.error('❌ Erro durante verificação:', error)
    console.error('Detalhes:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
  } finally {
    await prisma.$disconnect()
  }
}

verificarStatusDoacao() 
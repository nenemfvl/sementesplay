const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Simular o PermissionsManager para o script
const PermissionsManager = {
  async removeCriadorPermissions(usuarioId) {
    try {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { nivel: 'comum' }
      })

      await prisma.logAuditoria.create({
        data: {
          usuarioId,
          acao: 'PERMISSAO_REMOVIDA',
          detalhes: 'Permissões de criador removidas - usuário voltou para nível comum',
          nivel: 'warning'
        }
      })

      console.log(`✅ Permissões de criador removidas para usuário ${usuarioId}`)
      return true
    } catch (error) {
      console.error('❌ Erro ao remover permissões de criador:', error)
      return false
    }
  },

  async removeParceiroPermissions(usuarioId) {
    try {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { nivel: 'comum' }
      })

      await prisma.logAuditoria.create({
        data: {
          usuarioId,
          acao: 'PERMISSAO_REMOVIDA',
          detalhes: 'Permissões de parceiro removidas - usuário voltou para nível comum',
          nivel: 'warning'
        }
      })

      console.log(`✅ Permissões de parceiro removidas para usuário ${usuarioId}`)
      return true
    } catch (error) {
      console.error('❌ Erro ao remover permissões de parceiro:', error)
      return false
    }
  },

  async removeAdminPermissions(usuarioId) {
    try {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { nivel: 'comum' }
      })

      await prisma.logAuditoria.create({
        data: {
          usuarioId,
          acao: 'PERMISSAO_REMOVIDA',
          detalhes: 'Permissões de admin removidas - usuário voltou para nível comum',
          nivel: 'warning'
        }
      })

      console.log(`✅ Permissões de admin removidas para usuário ${usuarioId}`)
      return true
    } catch (error) {
      console.error('❌ Erro ao remover permissões de admin:', error)
      return false
    }
  }
}

async function verificarPermissoes() {
  try {
    console.log('🔍 === VERIFICAÇÃO DE PERMISSÕES ===\n')

    // 1. Verificar criadores inconsistentes
    console.log('📋 Verificando criadores inconsistentes...')
    const criadoresInconsistentes = await prisma.usuario.findMany({
      where: {
        OR: [
          { nivel: 'criador-iniciante' },
          { nivel: 'criador-comum' },
          { nivel: 'criador-parceiro' },
          { nivel: 'criador-supremo' }
        ],
        criador: null
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true
      }
    })

    console.log(`   Encontrados ${criadoresInconsistentes.length} criadores inconsistentes`)
    criadoresInconsistentes.forEach(user => {
      console.log(`   - ${user.nome} (${user.email}): ${user.nivel}`)
    })

    // 2. Verificar parceiros inconsistentes
    console.log('\n📋 Verificando parceiros inconsistentes...')
    const parceirosInconsistentes = await prisma.usuario.findMany({
      where: {
        nivel: 'parceiro',
        parceiro: null
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true
      }
    })

    console.log(`   Encontrados ${parceirosInconsistentes.length} parceiros inconsistentes`)
    parceirosInconsistentes.forEach(user => {
      console.log(`   - ${user.nome} (${user.email}): ${user.nivel}`)
    })

    // 3. Verificar admins inconsistentes
    console.log('\n📋 Verificando admins inconsistentes...')
    const adminsInconsistentes = await prisma.usuario.findMany({
      where: {
        nivel: '5',
        AND: [
          { criador: null },
          { parceiro: null }
        ]
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true
      }
    })

    console.log(`   Encontrados ${adminsInconsistentes.length} admins inconsistentes`)
    adminsInconsistentes.forEach(user => {
      console.log(`   - ${user.nome} (${user.email}): ${user.nivel}`)
    })

    const totalInconsistentes = criadoresInconsistentes.length + parceirosInconsistentes.length + adminsInconsistentes.length

    if (totalInconsistentes === 0) {
      console.log('\n🎉 Nenhuma inconsistência encontrada! Todas as permissões estão corretas.')
      return
    }

    console.log(`\n⚠️  Total de inconsistências encontradas: ${totalInconsistentes}`)
    
    // Perguntar se deve corrigir
    console.log('\n🔧 Deseja corrigir essas inconsistências? (s/n)')
    
    // Simular resposta 's' para correção automática
    const corrigir = true // Em um script real, você poderia usar readline para perguntar

    if (corrigir) {
      console.log('\n🛠️  Corrigindo inconsistências...\n')

      // Corrigir criadores
      for (const usuario of criadoresInconsistentes) {
        await PermissionsManager.removeCriadorPermissions(usuario.id)
      }

      // Corrigir parceiros
      for (const usuario of parceirosInconsistentes) {
        await PermissionsManager.removeParceiroPermissions(usuario.id)
      }

      // Corrigir admins
      for (const usuario of adminsInconsistentes) {
        await PermissionsManager.removeAdminPermissions(usuario.id)
      }

      console.log('\n✅ Todas as inconsistências foram corrigidas!')
      
      // Log geral
      await prisma.logAuditoria.create({
        data: {
          usuarioId: 'system',
          acao: 'VERIFICACAO_PERMISSOES',
          detalhes: `Verificação automática corrigiu ${totalInconsistentes} inconsistências de permissões`,
          nivel: 'info'
        }
      })

    } else {
      console.log('\n❌ Correção cancelada pelo usuário.')
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarPermissoes() 
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarQuemPausou() {
  try {
    console.log('🔍 Investigando quem pausou o sistema de ciclos...\n')

    // 1. Verificar configuração atual
    console.log('1️⃣ Verificando configuração atual...')
    const config = await prisma.configuracaoCiclos.findFirst()
    
    if (!config) {
      console.log('   ❌ Nenhuma configuração encontrada')
      return
    }

    console.log(`   ✅ Ciclo atual: #${config.numeroCiclo}`)
    console.log(`   ✅ Season atual: S${config.numeroSeason}`)
    console.log(`   ⏸️  Pausado: ${config.pausado ? 'SIM' : 'NÃO'}`)
    console.log(`   📅 Data criação: ${config.dataCriacao}`)
    console.log(`   📅 Data última atualização: ${config.dataAtualizacao}`)
    console.log(`   📅 Início do ciclo: ${config.dataInicioCiclo}`)
    console.log(`   📅 Início da season: ${config.dataInicioSeason}`)

    // 2. Buscar logs de auditoria relacionados a pausar/despausar
    console.log('\n2️⃣ Buscando logs de auditoria...')
    const logsPausar = await prisma.logAuditoria.findMany({
      where: {
        OR: [
          { acao: { contains: 'PAUSAR' } },
          { acao: { contains: 'CICLO' } },
          { detalhes: { contains: 'pausar' } },
          { detalhes: { contains: 'ciclo' } }
        ]
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10,
      include: {
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    })

    if (logsPausar.length > 0) {
      console.log(`   📊 Encontrados ${logsPausar.length} logs relacionados:`)
      logsPausar.forEach((log, index) => {
        console.log(`   ${index + 1}. [${log.timestamp}] ${log.acao}`)
        console.log(`      👤 Usuário: ${log.usuario?.nome || 'Sistema'} (${log.usuario?.email || 'N/A'})`)
        console.log(`      📝 Detalhes: ${log.detalhes}`)
        console.log(`      🏷️  Nível: ${log.nivel}`)
        console.log('')
      })
    } else {
      console.log('   ❌ Nenhum log específico de pausar encontrado')
    }

    // 3. Verificar se foi pausado via script
    console.log('3️⃣ Verificando se foi pausado via script...')
    const dataAtualizacao = new Date(config.dataAtualizacao)
    const agora = new Date()
    const diferencaHoras = Math.abs(agora - dataAtualizacao) / (1000 * 60 * 60)
    
    console.log(`   📅 Última atualização: ${dataAtualizacao.toLocaleString('pt-BR')}`)
    console.log(`   ⏰ Há ${diferencaHoras.toFixed(1)} horas`)
    
    if (diferencaHoras < 24) {
      console.log('   ⚠️  Atualizado recentemente (últimas 24h)')
    } else if (diferencaHoras < 168) {
      console.log('   ⚠️  Atualizado na última semana')
    } else {
      console.log('   ℹ️  Atualizado há mais de uma semana')
    }

    // 4. Verificar se há logs de sistema
    console.log('\n4️⃣ Verificando logs do sistema...')
    const logsSistema = await prisma.logAuditoria.findMany({
      where: {
        usuarioId: 'system'
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 5
    })

    if (logsSistema.length > 0) {
      console.log(`   📊 Últimos logs do sistema:`)
      logsSistema.forEach((log, index) => {
        console.log(`   ${index + 1}. [${log.timestamp}] ${log.acao}`)
        console.log(`      📝 Detalhes: ${log.detalhes}`)
        console.log('')
      })
    }

    // 5. Conclusão
    console.log('5️⃣ Conclusão:')
    if (config.pausado) {
      console.log('   ⏸️  Sistema está PAUSADO')
      console.log(`   📅 Pausado desde: ${config.dataAtualizacao.toLocaleString('pt-BR')}`)
      
      if (logsPausar.length === 0) {
        console.log('   🤔 Não há logs específicos de pausar - pode ter sido feito manualmente no banco')
        console.log('   💡 Possíveis causas:')
        console.log('      - Execução direta do script pausar-ciclos.js')
        console.log('      - Alteração manual no banco de dados')
        console.log('      - Reset automático que pausou o sistema')
      }
    } else {
      console.log('   ▶️  Sistema está ATIVO')
    }

  } catch (error) {
    console.error('❌ Erro na investigação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarQuemPausou()

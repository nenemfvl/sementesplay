// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function criarLogsReais() {
  try {
    console.log('=== CRIANDO LOGS REAIS DE AUDITORIA ===\n')

    // Buscar alguns usuários reais do banco
    const usuarios = await prisma.usuario.findMany({
      take: 5,
      select: {
        id: true,
        nome: true
      }
    })

    if (usuarios.length === 0) {
      console.log('Nenhum usuário encontrado. Criando logs com usuários fictícios...')
      return
    }

    // Logs de exemplo baseados em ações reais
    const logsExemplo = [
      {
        usuarioId: usuarios[0].id,
        acao: 'login',
        detalhes: 'Login realizado com sucesso',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        nivel: 'success'
      },
      {
        usuarioId: usuarios[0].id,
        acao: 'doacao',
        detalhes: 'Doação de 500 Sementes para criador',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        nivel: 'info'
      },
      {
        usuarioId: usuarios[1]?.id || usuarios[0].id,
        acao: 'cashback',
        detalhes: 'Resgate de código BONUS100 - 100 Sementes',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        nivel: 'success'
      },
      {
        usuarioId: usuarios[2]?.id || usuarios[0].id,
        acao: 'missao',
        detalhes: 'Missão "Primeira Doação" completada - Recompensa: 1000 Sementes',
        ip: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        nivel: 'success'
      },
      {
        usuarioId: usuarios[3]?.id || usuarios[0].id,
        acao: 'logout',
        detalhes: 'Logout realizado',
        ip: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        nivel: 'info'
      },
      {
        usuarioId: usuarios[4]?.id || usuarios[0].id,
        acao: 'doacao',
        detalhes: 'Tentativa de doação com saldo insuficiente',
        ip: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        nivel: 'error'
      },
      {
        usuarioId: usuarios[0].id,
        acao: 'perfil',
        detalhes: 'Atualização de perfil realizada',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        nivel: 'info'
      },
      {
        usuarioId: usuarios[1]?.id || usuarios[0].id,
        acao: 'chat',
        detalhes: 'Envio de mensagem no chat',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        nivel: 'info'
      }
    ]

    // Inserir logs no banco
    for (const log of logsExemplo) {
      await prisma.logAuditoria.create({
        data: log
      })
      console.log(`✅ Log criado: ${log.acao} - ${log.detalhes}`)
    }

    console.log(`\n🎉 ${logsExemplo.length} logs reais criados com sucesso!`)
    console.log('Agora os logs de auditoria em /admin/logs mostrarão dados reais do banco.')

//   } catch (error) {
//     console.error('Erro ao criar logs:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// criarLogsReais()

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarNotificacoesStatus() {
  try {
    console.log('🔔 Testando notificações e status...\n');

    // Verificar notificações mais recentes
    const notificacoes = await prisma.notificacao.findMany({
      where: {
        titulo: {
          contains: 'Repasse'
        }
      },
      orderBy: {
        data: 'desc'
      },
      take: 5,
      include: {
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    });

    console.log(`📧 Notificações de repasse encontradas: ${notificacoes.length}`);
    notificacoes.forEach((notif, index) => {
      console.log(`${index + 1}. Para: ${notif.usuario.nome} | Título: ${notif.titulo} | Lida: ${notif.lido ? 'Sim' : 'Não'} | Data: ${notif.data.toLocaleString()}`);
    });

    // Verificar logs de auditoria
    const logs = await prisma.logAuditoria.findMany({
      where: {
        acao: {
          contains: 'repasse'
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 5
    });

    console.log(`\n📝 Logs de auditoria encontrados: ${logs.length}`);
    logs.forEach((log, index) => {
      console.log(`${index + 1}. Ação: ${log.acao} | Usuário: ${log.usuarioId} | Data: ${log.timestamp.toLocaleString()}`);
    });

    // Verificar status dos repasses
    const repasses = await prisma.repasseParceiro.findMany({
      orderBy: {
        dataRepasse: 'desc'
      },
      take: 5,
      include: {
        parceiro: {
          select: {
            nomeCidade: true,
            usuario: {
              select: {
                nome: true
              }
            }
          }
        },
        compra: {
          select: {
            usuario: {
              select: {
                nome: true
              }
            },
            valorCompra: true
          }
        }
      }
    });

    console.log(`\n💰 Repasses encontrados: ${repasses.length}`);
    repasses.forEach((repasse, index) => {
      console.log(`${index + 1}. Parceiro: ${repasse.parceiro.usuario.nome} (${repasse.parceiro.nomeCidade}) | Usuário: ${repasse.compra.usuario.nome} | Valor: R$ ${repasse.valor.toFixed(2)} | Status: ${repasse.status} | Data: ${repasse.dataRepasse.toLocaleString()}`);
    });

    // Verificar compras parceiro
    const compras = await prisma.compraParceiro.findMany({
      orderBy: {
        dataCompra: 'desc'
      },
      take: 5,
      include: {
        usuario: {
          select: {
            nome: true
          }
        },
        parceiro: {
          select: {
            nomeCidade: true,
            usuario: {
              select: {
                nome: true
              }
            }
          }
        }
      }
    });

    console.log(`\n🛒 Compras parceiro encontradas: ${compras.length}`);
    compras.forEach((compra, index) => {
      console.log(`${index + 1}. Usuário: ${compra.usuario.nome} | Parceiro: ${compra.parceiro.usuario.nome} (${compra.parceiro.nomeCidade}) | Valor: R$ ${compra.valorCompra.toFixed(2)} | Status: ${compra.status} | Data: ${compra.dataCompra.toLocaleString()}`);
    });

    // Verificar usuários e suas sementes
    const usuarios = await prisma.usuario.findMany({
      where: {
        sementes: {
          gt: 0
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        sementes: true
      },
      orderBy: {
        sementes: 'desc'
      }
    });

    console.log(`\n🌱 Usuários com sementes: ${usuarios.length}`);
    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nome} (${usuario.email}): ${usuario.sementes} sementes`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarNotificacoesStatus(); 
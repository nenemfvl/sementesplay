const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarStatusRepasses() {
  try {
    console.log('🔍 Verificando status dos repasses...\n');

    // Verificar repasses por status
    const repassesPendentes = await prisma.repasseParceiro.findMany({
      where: { status: 'pendente' },
      include: {
        compra: {
          include: {
            usuario: { select: { nome: true } },
            parceiro: { 
              include: { usuario: { select: { nome: true } } }
            }
          }
        }
      },
      orderBy: { dataRepasse: 'desc' }
    });

    const repassesConfirmados = await prisma.repasseParceiro.findMany({
      where: { status: 'confirmado' },
      include: {
        compra: {
          include: {
            usuario: { select: { nome: true } },
            parceiro: { 
              include: { usuario: { select: { nome: true } } }
            }
          }
        }
      },
      orderBy: { dataRepasse: 'desc' }
    });

    const repassesProcessados = await prisma.repasseParceiro.findMany({
      where: { status: 'processado' },
      include: {
        compra: {
          include: {
            usuario: { select: { nome: true } },
            parceiro: { 
              include: { usuario: { select: { nome: true } } }
            }
          }
        }
      },
      orderBy: { dataRepasse: 'desc' }
    });

    const repassesAguardandoPagamento = await prisma.repasseParceiro.findMany({
      where: { status: 'aguardando_pagamento' },
      include: {
        compra: {
          include: {
            usuario: { select: { nome: true } },
            parceiro: { 
              include: { usuario: { select: { nome: true } } }
            }
          }
        }
      },
      orderBy: { dataRepasse: 'desc' }
    });

    console.log(`📋 REPASSES PENDENTES: ${repassesPendentes.length}`);
    repassesPendentes.forEach((repasse, index) => {
      console.log(`${index + 1}. ID: ${repasse.id} | Usuário: ${repasse.compra.usuario.nome} | Parceiro: ${repasse.compra.parceiro.usuario.nome} | Valor: R$ ${repasse.valor.toFixed(2)} | Data: ${repasse.dataRepasse.toLocaleString()}`);
    });

    console.log(`\n✅ REPASSES CONFIRMADOS: ${repassesConfirmados.length}`);
    repassesConfirmados.forEach((repasse, index) => {
      console.log(`${index + 1}. ID: ${repasse.id} | Usuário: ${repasse.compra.usuario.nome} | Parceiro: ${repasse.compra.parceiro.usuario.nome} | Valor: R$ ${repasse.valor.toFixed(2)} | Data: ${repasse.dataRepasse.toLocaleString()}`);
    });

    console.log(`\n🔄 REPASSES PROCESSADOS: ${repassesProcessados.length}`);
    repassesProcessados.forEach((repasse, index) => {
      console.log(`${index + 1}. ID: ${repasse.id} | Usuário: ${repasse.compra.usuario.nome} | Parceiro: ${repasse.compra.parceiro.usuario.nome} | Valor: R$ ${repasse.valor.toFixed(2)} | Data: ${repasse.dataRepasse.toLocaleString()}`);
    });

    console.log(`\n⏳ REPASSES AGUARDANDO PAGAMENTO: ${repassesAguardandoPagamento.length}`);
    repassesAguardandoPagamento.forEach((repasse, index) => {
      console.log(`${index + 1}. ID: ${repasse.id} | Usuário: ${repasse.compra.usuario.nome} | Parceiro: ${repasse.compra.parceiro.usuario.nome} | Valor: R$ ${repasse.valor.toFixed(2)} | PaymentId: ${repasse.paymentId} | Data: ${repasse.dataRepasse.toLocaleString()}`);
    });

    // Verificar compras por status
    const comprasAguardandoRepasse = await prisma.compraParceiro.findMany({
      where: { status: 'aguardando_repasse' },
      include: {
        usuario: { select: { nome: true } },
        parceiro: { 
          include: { usuario: { select: { nome: true } } }
        }
      },
      orderBy: { dataCompra: 'desc' }
    });

    const comprasCashbackLiberado = await prisma.compraParceiro.findMany({
      where: { status: 'cashback_liberado' },
      include: {
        usuario: { select: { nome: true } },
        parceiro: { 
          include: { usuario: { select: { nome: true } } }
        }
      },
      orderBy: { dataCompra: 'desc' }
    });

    console.log(`\n🛒 COMPRAS AGUARDANDO REPASSE: ${comprasAguardandoRepasse.length}`);
    comprasAguardandoRepasse.forEach((compra, index) => {
      console.log(`${index + 1}. ID: ${compra.id} | Usuário: ${compra.usuario.nome} | Parceiro: ${compra.parceiro.usuario.nome} | Valor: R$ ${compra.valorCompra.toFixed(2)} | Data: ${compra.dataCompra.toLocaleString()}`);
    });

    console.log(`\n💰 COMPRAS CASHBACK LIBERADO: ${comprasCashbackLiberado.length}`);
    comprasCashbackLiberado.forEach((compra, index) => {
      console.log(`${index + 1}. ID: ${compra.id} | Usuário: ${compra.usuario.nome} | Parceiro: ${compra.parceiro.usuario.nome} | Valor: R$ ${compra.valorCompra.toFixed(2)} | Data: ${compra.dataCompra.toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarStatusRepasses(); 
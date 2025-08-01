const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corrigirStatusCompras() {
  try {
    console.log('🔧 Corrigindo status de compras...\n');

    // Buscar compras que têm repasse processado mas status antigo
    const comprasComRepasse = await prisma.compraParceiro.findMany({
      where: {
        repasse: {
          status: 'processado'
        },
        status: {
          not: 'cashback_liberado'
        }
      },
      include: {
        repasse: true,
        usuario: {
          select: { nome: true }
        },
        parceiro: {
          select: { nomeCidade: true }
        }
      }
    });

    console.log(`📋 COMPRAS COM REPASSE PROCESSADO MAS STATUS ANTIGO: ${comprasComRepasse.length}\n`);

    if (comprasComRepasse.length === 0) {
      console.log('✅ Nenhuma compra precisa ser corrigida');
      return;
    }

    // Atualizar status das compras
    for (const compra of comprasComRepasse) {
      console.log(`🔄 Corrigindo compra ${compra.id}:`);
      console.log(`   Usuário: ${compra.usuario.nome}`);
      console.log(`   Parceiro: ${compra.parceiro.nomeCidade}`);
      console.log(`   Status atual: ${compra.status}`);
      console.log(`   Repasse status: ${compra.repasse.status}`);

      await prisma.compraParceiro.update({
        where: { id: compra.id },
        data: { status: 'cashback_liberado' }
      });

      console.log(`   ✅ Status atualizado para: cashback_liberado\n`);
    }

    // Verificar se há compras com status inválidos
    const comprasInvalidas = await prisma.compraParceiro.findMany({
      where: {
        status: {
          in: ['aguardando_pagamento', 'repasse_confirmado']
        }
      },
      include: {
        usuario: {
          select: { nome: true }
        },
        parceiro: {
          select: { nomeCidade: true }
        }
      }
    });

    console.log(`📋 COMPRAS COM STATUS INVÁLIDOS: ${comprasInvalidas.length}\n`);

    if (comprasInvalidas.length > 0) {
      console.log('⚠️ Compras que ainda estão pendentes:');
      comprasInvalidas.forEach((compra, index) => {
        console.log(`  ${index + 1}. ID: ${compra.id}`);
        console.log(`     Usuário: ${compra.usuario.nome}`);
        console.log(`     Parceiro: ${compra.parceiro.nomeCidade}`);
        console.log(`     Status: ${compra.status}`);
        console.log(`     Data: ${compra.dataCompra.toLocaleDateString('pt-BR')}`);
        console.log('');
      });
    }

    console.log('✅ Correção concluída!');

  } catch (error) {
    console.error('❌ Erro ao corrigir status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirStatusCompras(); 
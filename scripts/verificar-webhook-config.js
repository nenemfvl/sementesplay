const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarWebhookConfig() {
  try {
    console.log('🔍 Verificando configuração do webhook...\\n');

    // Verificar variáveis de ambiente
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    console.log('🔑 MERCADOPAGO_ACCESS_TOKEN:');
    console.log(`   Configurado: ${accessToken ? '✅ SIM' : '❌ NÃO'}`);
    if (accessToken) {
      console.log(`   Tamanho: ${accessToken.length} caracteres`);
      console.log(`   Início: ${accessToken.substring(0, 10)}...`);
    }
    console.log('');

    // Verificar URL do webhook
    const webhookUrl = 'https://sementesplay.vercel.app/api/mercadopago/webhook';
    console.log('🌐 WEBHOOK URL:');
    console.log(`   URL: ${webhookUrl}`);
    console.log('');

    // Verificar repasses recentes
    const repassesRecentes = await prisma.repasseParceiro.findMany({
      where: {
        status: 'aguardando_pagamento'
      },
      include: {
        compra: {
          include: {
            usuario: true,
            parceiro: true
          }
        }
      },
      orderBy: { dataRepasse: 'desc' },
      take: 5
    });

    console.log('📊 REPASSES AGUARDANDO PAGAMENTO:');
    console.log(`   Total: ${repassesRecentes.length}`);
    
    if (repassesRecentes.length > 0) {
      repassesRecentes.forEach((repasse, index) => {
        console.log(`   ${index + 1}. ID: ${repasse.id}`);
        console.log(`      PaymentId: ${repasse.paymentId || 'N/A'}`);
        console.log(`      Valor: R$ ${repasse.valor}`);
        console.log(`      Usuário: ${repasse.compra.usuario.nome}`);
        console.log(`      Data: ${repasse.dataRepasse ? repasse.dataRepasse.toLocaleDateString() : 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('   ✅ Nenhum repasse aguardando pagamento');
    }

    // Verificar logs de webhook
    console.log('📋 DIAGNÓSTICO:');
    console.log('   1. Verifique se o MERCADOPAGO_ACCESS_TOKEN está configurado no Vercel');
    console.log('   2. Verifique se a URL do webhook está configurada no painel do MercadoPago');
    console.log('   3. Verifique os logs do Vercel para ver se o webhook está sendo chamado');
    console.log('   4. Teste o webhook manualmente se necessário');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarWebhookConfig(); 
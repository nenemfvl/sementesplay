const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarWebhookReal() {
  try {
    console.log('🌐 Testando chamada real ao webhook...\n');

    // Buscar repasse confirmado para simular webhook
    const repasse = await prisma.repasseParceiro.findFirst({
      where: { 
        status: 'confirmado',
        paymentId: { not: null }
      },
      include: {
        compra: {
          include: {
            parceiro: {
              include: {
                usuario: true
              }
            },
            usuario: true
          }
        }
      }
    });

    if (!repasse) {
      console.log('❌ Nenhum repasse confirmado com paymentId encontrado');
      return;
    }

    console.log('📋 Repasse encontrado:');
    console.log(`   ID: ${repasse.id}`);
    console.log(`   PaymentId: ${repasse.paymentId}`);
    console.log(`   Valor: R$ ${repasse.valor}`);
    console.log(`   Status: ${repasse.status}`);
    console.log(`   Parceiro: ${repasse.compra.parceiro.usuario.nome}`);
    console.log(`   Usuário: ${repasse.compra.usuario.nome}`);

    // Simular payload do webhook do MercadoPago
    const webhookPayload = {
      action: 'payment.created',
      data: {
        id: repasse.paymentId
      }
    };

    console.log('\n📤 Simulando chamada ao webhook...');
    console.log(`   URL: /api/mercadopago/webhook`);
    console.log(`   Payload:`, JSON.stringify(webhookPayload, null, 2));

    // Fazer chamada HTTP para o webhook
    const response = await fetch('http://localhost:3000/api/mercadopago/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '127.0.0.1'
      },
      body: JSON.stringify(webhookPayload)
    });

    const result = await response.json();
    
    console.log('\n📥 Resposta do webhook:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Webhook processado com sucesso!');
      
      // Verificar se as notificações foram criadas
      const notificacoes = await prisma.notificacao.findMany({
        where: {
          usuarioId: repasse.compra.usuarioId,
          titulo: {
            contains: 'Cashback'
          }
        },
        orderBy: {
          data: 'desc'
        },
        take: 1
      });

      console.log(`\n📧 Notificações criadas: ${notificacoes.length}`);
      if (notificacoes.length > 0) {
        console.log(`   Título: ${notificacoes[0].titulo}`);
        console.log(`   Mensagem: ${notificacoes[0].mensagem}`);
        console.log(`   Data: ${notificacoes[0].data.toLocaleString()}`);
      }

      // Verificar logs de auditoria
      const logs = await prisma.logAuditoria.findMany({
        where: {
          acao: {
            contains: 'WEBHOOK'
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 1
      });

      console.log(`\n📝 Logs de auditoria criados: ${logs.length}`);
      if (logs.length > 0) {
        console.log(`   Ação: ${logs[0].acao}`);
        console.log(`   Data: ${logs[0].timestamp.toLocaleString()}`);
      }

    } else {
      console.log('❌ Erro no webhook:', result);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarWebhookReal(); 
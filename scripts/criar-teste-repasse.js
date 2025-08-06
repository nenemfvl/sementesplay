// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function criarTesteRepasse() {
  try {
    console.log('🔧 Criando teste de repasse...\n');

    // 1. Verificar se existem usuários e parceiros
    console.log('1. Verificando usuários e parceiros...');
    
    const usuarios = await prisma.usuario.findMany({
      take: 2
    });

    if (usuarios.length < 2) {
      console.log('   ❌ Preciso de pelo menos 2 usuários para o teste');
      return;
    }

    const parceiros = await prisma.parceiro.findMany({
      include: {
        usuario: true
      }
    });

    if (parceiros.length === 0) {
      console.log('   ❌ Nenhum parceiro encontrado. Criando um parceiro...');
      
      // Criar um parceiro
      const parceiro = await prisma.parceiro.create({
        data: {
          usuarioId: usuarios[0].id,
          saldoDevedor: 0
        },
        include: {
          usuario: true
        }
      });
      
      parceiros.push(parceiro);
      console.log(`   ✅ Parceiro criado: ${parceiro.usuario.nome}`);
    }

    const usuario = usuarios[1];
    const parceiro = parceiros[0];

    console.log(`   Usuário: ${usuario.nome} (${usuario.id})`);
    console.log(`   Parceiro: ${parceiro.usuario.nome} (${parceiro.id})`);

    // 2. Criar uma compra de parceiro
    console.log('\n2. Criando compra de parceiro...');
    
    const compra = await prisma.compraParceiro.create({
      data: {
        usuarioId: usuario.id,
        parceiroId: parceiro.id,
        valorCompra: 5.00, // Valor da compra menor
        cupomUsado: 'sementesplay20',
        status: 'aguardando_repasse'
      },
      include: {
        usuario: true,
        parceiro: {
          include: {
            usuario: true
          }
        }
      }
    });

    console.log(`   ✅ Compra criada: ID ${compra.id}`);
    console.log(`   Valor: R$ ${compra.valorCompra.toFixed(2)}`);
    console.log(`   Status: ${compra.status}`);

    // 3. Criar um repasse
    console.log('\n3. Criando repasse...');
    
    const valorRepasse = compra.valorCompra * 0.10; // 10% da compra
    
    const repasse = await prisma.repasseParceiro.create({
      data: {
        parceiroId: parceiro.id,
        compraId: compra.id,
        valor: valorRepasse,
        status: 'pendente'
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

    console.log(`   ✅ Repasse criado: ID ${repasse.id}`);
    console.log(`   Valor: R$ ${repasse.valor.toFixed(2)}`);
    console.log(`   Status: ${repasse.status}`);

    // 4. Atualizar saldo devedor do parceiro
    console.log('\n4. Atualizando saldo devedor do parceiro...');
    
    await prisma.parceiro.update({
      where: { id: parceiro.id },
      data: { saldoDevedor: { increment: valorRepasse } }
    });

    const parceiroAtualizado = await prisma.parceiro.findUnique({
      where: { id: parceiro.id }
    });

    console.log(`   ✅ Saldo devedor atualizado: R$ ${parceiroAtualizado.saldoDevedor.toFixed(2)}`);

    // 5. Verificar se a carteira do usuário existe
    console.log('\n5. Verificando carteira do usuário...');
    
    let carteira = await prisma.carteiraDigital.findUnique({
      where: { usuarioId: usuario.id }
    });

    if (!carteira) {
      console.log('   Criando carteira para o usuário...');
      carteira = await prisma.carteiraDigital.create({
        data: {
          usuarioId: usuario.id,
          saldo: 0
        }
      });
      console.log('   ✅ Carteira criada');
    }

    console.log(`   Saldo atual: R$ ${carteira.saldo.toFixed(2)}`);

    // 6. Resumo final
    console.log('\n✅ Teste criado com sucesso!');
    console.log('\n📋 Resumo do teste:');
    console.log(`   Compra ID: ${compra.id}`);
    console.log(`   Repasse ID: ${repasse.id}`);
    console.log(`   Valor da compra: R$ ${compra.valorCompra.toFixed(2)}`);
    console.log(`   Valor do repasse: R$ ${repasse.valor.toFixed(2)}`);
    console.log(`   Usuário: ${usuario.nome}`);
    console.log(`   Parceiro: ${parceiro.usuario.nome}`);
    console.log(`   Saldo devedor do parceiro: R$ ${parceiroAtualizado.saldoDevedor.toFixed(2)}`);
    
    console.log('\n🚀 Agora você pode testar o pagamento PIX no painel parceiro!');

//   } catch (error) {
//     console.error('❌ Erro durante a criação do teste:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// criarTesteRepasse(); 
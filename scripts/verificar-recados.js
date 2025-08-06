// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function verificarRecados() {
  try {
    console.log('🔍 Verificando recados no banco de dados...\n');
    
    // Verificar todos os recados
    const recados = await prisma.recado.findMany({
      include: {
        remetente: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true
          }
        },
        destinatario: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true
          }
        }
      },
      orderBy: {
        dataEnvio: 'desc'
      }
    });

    console.log(`📊 Total de recados encontrados: ${recados.length}\n`);

    if (recados.length > 0) {
      console.log('📝 Recados encontrados:');
      recados.forEach((recado, index) => {
        console.log(`\n${index + 1}. ID: ${recado.id}`);
        console.log(`   De: ${recado.remetente.nome} (${recado.remetente.nivel}) - ${recado.remetente.email}`);
        console.log(`   Para: ${recado.destinatario.nome} (${recado.destinatario.nivel}) - ${recado.destinatario.email}`);
        console.log(`   Título: ${recado.titulo}`);
        console.log(`   Mensagem: ${recado.mensagem}`);
        console.log(`   Data: ${recado.dataEnvio}`);
        console.log(`   Lido: ${recado.lido}`);
        console.log(`   Resposta: ${recado.resposta || 'Nenhuma'}`);
      });
    } else {
      console.log('❌ Nenhum recado encontrado no banco de dados.');
    }

    // Verificar usuários criadores
    console.log('\n👥 Verificando usuários criadores...');
    const criadores = await prisma.usuario.findMany({
      where: {
        nivel: 'criador'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true
      }
    });

    console.log(`\n🎯 Total de criadores: ${criadores.length}`);
    criadores.forEach(criador => {
      console.log(`   - ${criador.nome} (${criador.email}) - ID: ${criador.id}`);
    });

//   } catch (error) {
//     console.error('❌ Erro ao verificar recados:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// verificarRecados(); 
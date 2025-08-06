// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function verificarUsuariosExistentes() {
  try {
    console.log('🔍 Verificando usuários existentes...\n');

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        sementes: true
      },
      take: 10
    });

    if (usuarios.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco');
      return;
    }

    console.log(`✅ Encontrados ${usuarios.length} usuários:`);
    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ID: ${usuario.id} | Nome: ${usuario.nome} | Email: ${usuario.email} | Tipo: ${usuario.tipo} | Sementes: ${usuario.sementes}`);
    });

    // Verificar parceiros
    const parceiros = await prisma.parceiro.findMany({
      select: {
        id: true,
        usuarioId: true,
        saldoDevedor: true
      },
      take: 5
    });

    console.log(`\n🔍 Encontrados ${parceiros.length} parceiros:`);
    parceiros.forEach((parceiro, index) => {
      console.log(`${index + 1}. ID: ${parceiro.id} | UsuarioID: ${parceiro.usuarioId} | Saldo Devedor: R$ ${parceiro.saldoDevedor.toFixed(2)}`);
    });

//   } catch (error) {
//     console.error('❌ Erro:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// verificarUsuariosExistentes(); 
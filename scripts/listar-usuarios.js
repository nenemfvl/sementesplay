const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listarUsuarios() {
  try {
    console.log('Listando todos os usuários...');
    
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        tipo: true
      }
    });
    
    console.log('Usuários encontrados:');
    usuarios.forEach(usuario => {
      console.log(`- ${usuario.nome} (${usuario.email}): nivel=${usuario.nivel}, tipo=${usuario.tipo}`);
    });
    
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listarUsuarios(); 
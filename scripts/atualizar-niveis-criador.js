// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function atualizarNiveisCriador() {
  try {
    console.log('Atualizando níveis de criadores...');
    
    // Buscar todos os usuários com nível "supremo"
    const usuariosSupremo = await prisma.usuario.findMany({
      where: { nivel: 'supremo' },
      select: { id: true, nome: true, email: true, nivel: true }
    });
    
    console.log(`Encontrados ${usuariosSupremo.length} usuários com nível "supremo":`);
    usuariosSupremo.forEach(u => console.log(`- ${u.nome} (${u.email})`));
    
    // Atualizar cada um para "criador-supremo"
    for (const usuario of usuariosSupremo) {
      const updated = await prisma.usuario.update({
        where: { id: usuario.id },
        data: { nivel: 'criador-supremo' }
      });
      console.log(`Atualizado: ${updated.nome} -> ${updated.nivel}`);
    }
    
    console.log('Atualização concluída!');
//   } catch (error) {
//     console.error('Erro ao atualizar níveis:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// atualizarNiveisCriador(); 
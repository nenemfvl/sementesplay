// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function verificarConteudos() {
  try {
    console.log('🔍 Verificando conteúdos no banco de dados...\n');

    const conteudos = await prisma.conteudo.findMany({
      select: {
        id: true,
        titulo: true,
        preview: true,
        tipo: true,
        url: true,
        categoria: true
      },
      take: 10
    });

    console.log(`Total de conteúdos encontrados: ${conteudos.length}\n`);

    if (conteudos.length > 0) {
      console.log('Detalhes dos conteúdos:');
      conteudos.forEach((conteudo, index) => {
        console.log(`\n${index + 1}. ${conteudo.titulo}`);
        console.log(`   ID: ${conteudo.id}`);
        console.log(`   Tipo: ${conteudo.tipo}`);
        console.log(`   Categoria: ${conteudo.categoria}`);
        console.log(`   URL: ${conteudo.url}`);
        console.log(`   Preview: ${conteudo.preview || 'NÃO TEM PREVIEW'}`);
      });
    } else {
      console.log('Nenhum conteúdo encontrado no banco de dados.');
    }

//   } catch (error) {
//     console.error('Erro ao verificar conteúdos:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// verificarConteudos(); 
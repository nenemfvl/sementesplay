const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addConteudosVelin() {
  try {
    console.log('🎬 Adicionando conteúdos para o criador velin...')

    // Buscar o usuário velin
    const usuario = await prisma.usuario.findFirst({
      where: { nome: 'velin' }
    })

    if (!usuario) {
      console.log('❌ Usuário velin não encontrado!')
      return
    }

    // Buscar o criador velin
    const criador = await prisma.criador.findUnique({
      where: { usuarioId: usuario.id }
    })

    if (!criador) {
      console.log('❌ Criador velin não encontrado!')
      return
    }

    console.log(`✅ Criador encontrado: ${criador.nome} (ID: ${criador.id})`)

    // Conteúdos de exemplo
    const conteudos = [
      {
        titulo: '🎮 FiveM RP - Primeira Live da Cidade',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        tipo: 'video',
        categoria: 'FiveM',
        descricao: 'Primeira transmissão ao vivo da nossa cidade FiveM RP! Venha conhecer o servidor e participar da comunidade.',
        plataforma: 'youtube',
        visualizacoes: 1250,
        curtidas: 89,
        compartilhamentos: 23,
        preview: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
      },
      {
        titulo: '🏙️ Tour Completo da Cidade FiveM',
        url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        tipo: 'video',
        categoria: 'FiveM',
        descricao: 'Tour completo pela nossa cidade FiveM RP. Conheça todos os pontos importantes e locais de interesse.',
        plataforma: 'youtube',
        visualizacoes: 2100,
        curtidas: 156,
        compartilhamentos: 45,
        preview: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg'
      },
      {
        titulo: '🚔 Tutorial: Como ser Policial na Cidade',
        url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        tipo: 'video',
        categoria: 'Tutorial',
        descricao: 'Aprenda como se tornar um policial eficiente na nossa cidade FiveM RP. Dicas e truques para iniciantes.',
        plataforma: 'youtube',
        visualizacoes: 890,
        curtidas: 67,
        compartilhamentos: 12,
        preview: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg'
      },
      {
        titulo: '💼 Guia Completo: Profissões na Cidade',
        url: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
        tipo: 'video',
        categoria: 'Guia',
        descricao: 'Guia completo sobre todas as profissões disponíveis na nossa cidade FiveM RP. Escolha sua carreira!',
        plataforma: 'youtube',
        visualizacoes: 1560,
        curtidas: 134,
        compartilhamentos: 28,
        preview: 'https://img.youtube.com/vi/ZZ5LpwO-An4/hqdefault.jpg'
      },
      {
        titulo: '🎯 Evento Especial: Corrida de Carros',
        url: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
        tipo: 'video',
        categoria: 'Evento',
        descricao: 'Evento especial de corrida de carros na cidade! Premiação em Sementes para os vencedores.',
        plataforma: 'youtube',
        visualizacoes: 3200,
        curtidas: 245,
        compartilhamentos: 67,
        preview: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg'
      }
    ]

    // Adicionar conteúdos
    for (const conteudo of conteudos) {
      // Verificar se o conteúdo já existe
      const existing = await prisma.conteudo.findFirst({
        where: {
          criadorId: criador.id,
          titulo: conteudo.titulo
        }
      })

      if (!existing) {
        await prisma.conteudo.create({
          data: {
            criadorId: criador.id,
            titulo: conteudo.titulo,
            url: conteudo.url,
            tipo: conteudo.tipo,
            categoria: conteudo.categoria,
            descricao: conteudo.descricao,
            plataforma: conteudo.plataforma,
            visualizacoes: conteudo.visualizacoes,
            curtidas: conteudo.curtidas,
            compartilhamentos: conteudo.compartilhamentos,
            preview: conteudo.preview
          }
        })
        console.log(`✅ Conteúdo adicionado: ${conteudo.titulo}`)
      } else {
        console.log(`⚠️ Conteúdo já existe: ${conteudo.titulo}`)
      }
    }

    // Adicionar alguns comentários de exemplo
    const comentarios = [
      {
        texto: 'Muito bom o conteúdo! Parabéns velin! 🎉',
        usuarioId: usuario.id
      },
      {
        texto: 'Adorei o tutorial de policial! Muito útil 👮‍♂️',
        usuarioId: usuario.id
      },
      {
        texto: 'Quando vai ter mais eventos como esse? 🏁',
        usuarioId: usuario.id
      }
    ]

    // Buscar o primeiro conteúdo para adicionar comentários
    const primeiroConteudo = await prisma.conteudo.findFirst({
      where: { criadorId: criador.id }
    })

    if (primeiroConteudo) {
      for (const comentario of comentarios) {
        await prisma.comentario.create({
          data: {
            conteudoId: primeiroConteudo.id,
            usuarioId: comentario.usuarioId,
            texto: comentario.texto
          }
        })
        console.log(`💬 Comentário adicionado: ${comentario.texto}`)
      }
    }

    console.log('\n🎉 Conteúdos adicionados com sucesso para velin!')
    console.log('📊 Estatísticas dos conteúdos:')
    console.log(`- Total de vídeos: ${conteudos.length}`)
    console.log(`- Total de visualizações: ${conteudos.reduce((sum, c) => sum + c.visualizacoes, 0)}`)
    console.log(`- Total de curtidas: ${conteudos.reduce((sum, c) => sum + c.curtidas, 0)}`)
    console.log(`- Total de compartilhamentos: ${conteudos.reduce((sum, c) => sum + c.compartilhamentos, 0)}`)

  } catch (error) {
    console.error('❌ Erro ao adicionar conteúdos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addConteudosVelin()
}

module.exports = { addConteudosVelin } 
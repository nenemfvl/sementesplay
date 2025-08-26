const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🎬 Criando conteúdos de exemplo para parceiros...')

  try {
    // Buscar o primeiro parceiro existente
    const parceiro = await prisma.parceiro.findFirst({
      include: {
        usuario: true
      }
    })

    if (!parceiro) {
      console.log('❌ Nenhum parceiro encontrado. Execute o seed primeiro.')
      return
    }

    console.log(`📱 Criando conteúdos para o parceiro: ${parceiro.usuario.nome}`)

    // Criar conteúdos de exemplo
    const conteudos = [
      {
        parceiroId: parceiro.id,
        titulo: '🎮 Servidor FiveM RP - Cidade Realista',
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        tipo: 'youtube',
        categoria: 'gaming',
        descricao: 'Conheça nosso servidor FiveM com sistema RP completo e realista',
        plataforma: 'youtube',
        visualizacoes: 15420,
        curtidas: 892,
        dislikes: 23,
        compartilhamentos: 156,
        cidade: 'São Paulo',
        endereco: 'Servidor Online 24/7'
      },
      {
        parceiroId: parceiro.id,
        titulo: '📱 Instagram - Dicas de RP',
        url: 'https://instagram.com/p/example1',
        tipo: 'instagram',
        categoria: 'dicas',
        descricao: 'Dicas diárias para melhorar seu RP no FiveM',
        plataforma: 'instagram',
        visualizacoes: 8920,
        curtidas: 445,
        dislikes: 12,
        compartilhamentos: 89,
        cidade: 'São Paulo',
        endereco: 'Instagram @cidadefivem'
      },
      {
        parceiroId: parceiro.id,
        titulo: '🎵 TikTok - Momentos Épicos',
        url: 'https://tiktok.com/@cidadefivem/video/123456',
        tipo: 'tiktok',
        categoria: 'entretenimento',
        descricao: 'Os momentos mais épicos do nosso servidor FiveM',
        plataforma: 'tiktok',
        visualizacoes: 23450,
        curtidas: 1234,
        dislikes: 45,
        compartilhamentos: 234,
        cidade: 'São Paulo',
        endereco: 'TikTok @cidadefivem'
      },
      {
        parceiroId: parceiro.id,
        titulo: '📺 Twitch - Stream ao Vivo',
        url: 'https://twitch.tv/cidadefivem',
        tipo: 'twitch',
        categoria: 'streaming',
        descricao: 'Stream ao vivo do nosso servidor FiveM RP',
        plataforma: 'twitch',
        visualizacoes: 5670,
        curtidas: 234,
        dislikes: 8,
        compartilhamentos: 67,
        cidade: 'São Paulo',
        endereco: 'Twitch.tv/cidadefivem'
      },
      {
        parceiroId: parceiro.id,
        titulo: '🔗 Site Oficial - Cidade FiveM',
        url: 'https://cidadefivem.com.br',
        tipo: 'link',
        categoria: 'oficial',
        descricao: 'Site oficial da nossa cidade FiveM RP',
        plataforma: 'web',
        visualizacoes: 3450,
        curtidas: 123,
        dislikes: 5,
        compartilhamentos: 45,
        cidade: 'São Paulo',
        endereco: 'cidadefivem.com.br'
      }
    ]

    // Inserir conteúdos
    for (const conteudo of conteudos) {
      await prisma.conteudoParceiro.create({
        data: conteudo
      })
      console.log(`✅ Criado: ${conteudo.titulo}`)
    }

    console.log('🎉 Conteúdos criados com sucesso!')
    console.log(`📊 Total de conteúdos criados: ${conteudos.length}`)

  } catch (error) {
    console.error('❌ Erro ao criar conteúdos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

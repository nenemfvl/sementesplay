const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarAPI() {
  console.log('🧪 Testando API de conteúdos dos parceiros...')

  try {
    // Testar busca direta no banco
    console.log('\n📊 Buscando conteúdos diretamente no banco...')
    const conteudos = await prisma.conteudoParceiro.findMany({
      include: {
        parceiro: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      where: {
        removido: false
      }
    })

    console.log(`✅ Encontrados ${conteudos.length} conteúdos no banco`)
    
    if (conteudos.length > 0) {
      console.log('\n📋 Primeiro conteúdo:')
      const primeiro = conteudos[0]
      console.log(`- ID: ${primeiro.id}`)
      console.log(`- Título: ${primeiro.titulo}`)
      console.log(`- URL: ${primeiro.url}`)
      console.log(`- Tipo: ${primeiro.tipo}`)
      console.log(`- Parceiro: ${primeiro.parceiro.usuario.nome}`)
      console.log(`- Visualizações: ${primeiro.visualizacoes}`)
    }

    // Testar a função de formatação da API
    console.log('\n🔧 Testando formatação da API...')
    const conteudosFormatados = conteudos.map(conteudo => {
      let thumbnail = conteudo.preview || null
      if (!thumbnail && conteudo.url && conteudo.url.includes('youtube')) {
        const yt = conteudo.url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/)
        if (yt) {
          thumbnail = `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`
        }
      }
      
      return {
        id: conteudo.id,
        titulo: conteudo.titulo || '',
        url: conteudo.url || '',
        tipo: conteudo.tipo || '',
        categoria: conteudo.categoria || '',
        descricao: conteudo.descricao || '',
        plataforma: conteudo.plataforma || '',
        data: conteudo.dataPublicacao ? conteudo.dataPublicacao.toISOString() : new Date().toISOString(),
        visualizacoes: conteudo.visualizacoes || 0,
        curtidas: conteudo.curtidas || 0,
        dislikes: conteudo.dislikes || 0,
        compartilhamentos: conteudo.compartilhamentos || 0,
        thumbnail: thumbnail || '/thumbnails/default.jpg',
        cidade: conteudo.cidade || '',
        endereco: conteudo.endereco || '',
        dataEvento: conteudo.dataEvento ? conteudo.dataEvento.toISOString() : null,
        preco: conteudo.preco || '',
        vagas: conteudo.vagas || null,
        fixado: conteudo.fixado || false,
        parceiro: {
          id: conteudo.parceiro.id,
          nome: conteudo.parceiro.usuario.nome,
          avatar: conteudo.parceiro.usuario.avatarUrl || '🏢',
          nomeCidade: conteudo.parceiro.nomeCidade
        }
      }
    })

    console.log(`✅ Formatação concluída para ${conteudosFormatados.length} conteúdos`)
    
    if (conteudosFormatados.length > 0) {
      console.log('\n📋 Primeiro conteúdo formatado:')
      const primeiro = conteudosFormatados[0]
      console.log(`- ID: ${primeiro.id}`)
      console.log(`- Título: ${primeiro.titulo}`)
      console.log(`- URL: ${primeiro.url}`)
      console.log(`- Tipo: ${primeiro.tipo}`)
      console.log(`- Parceiro: ${primeiro.parceiro.nome}`)
      console.log(`- Visualizações: ${primeiro.visualizacoes}`)
      console.log(`- Thumbnail: ${primeiro.thumbnail}`)
    }

    // Testar função getThumbnail do componente
    console.log('\n🖼️ Testando função getThumbnail...')
    const testUrls = [
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://instagram.com/p/example1',
      'https://tiktok.com/@cidadefivem/video/123456',
      'https://twitch.tv/cidadefivem',
      'https://cidadefivem.com.br'
    ]

    testUrls.forEach(url => {
      let thumbnail = null
      
      // YouTube
      const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/)
      if (yt) {
        thumbnail = {
          src: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
          platform: 'YouTube',
          icon: '🎥',
          color: 'from-red-500 to-red-600'
        }
      }
      
      // Twitch - Stream ao vivo
      const twLive = url.match(/twitch\.tv\/([^/?]+)/)
      if (twLive && !url.includes('/videos/')) {
        thumbnail = {
          src: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twLive[1]}.jpg`,
          platform: 'Twitch Live',
          icon: '📺',
          color: 'from-purple-600 to-pink-600',
          fallback: true
        }
      }
      
      // Instagram
      if (url.includes('instagram.com')) {
        thumbnail = {
          src: null,
          platform: 'Instagram',
          icon: '📷',
          color: 'from-pink-500 via-purple-500 to-orange-500'
        }
      }
      
      // TikTok
      if (url.includes('tiktok.com')) {
        thumbnail = {
          src: null,
          platform: 'TikTok',
          icon: '🎵',
          color: 'from-black via-gray-800 to-gray-600'
        }
      }
      
      // Links gerais
      if (!thumbnail) {
        thumbnail = {
          src: null,
          platform: 'Link',
          icon: '🔗',
          color: 'from-blue-500 to-blue-600'
        }
      }

      console.log(`\n🔗 ${url}`)
      console.log(`  - Platform: ${thumbnail.platform}`)
      console.log(`  - Icon: ${thumbnail.icon}`)
      console.log(`  - Color: ${thumbnail.color}`)
      console.log(`  - Src: ${thumbnail.src || 'null'}`)
    })

  } catch (error) {
    console.error('❌ Erro ao testar:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarAPI()

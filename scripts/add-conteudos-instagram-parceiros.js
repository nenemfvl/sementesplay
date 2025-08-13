const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addConteudosInstagramParceiros() {
  try {
    console.log('📱 Adicionando conteúdos do Instagram para parceiros...')

    // Buscar todos os parceiros
    const parceiros = await prisma.parceiro.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    if (parceiros.length === 0) {
      console.log('❌ Nenhum parceiro encontrado!')
      return
    }

    console.log(`✅ Encontrados ${parceiros.length} parceiros`)

    // Conteúdos de exemplo com Instagram para parceiros
    const conteudosInstagram = [
      {
        titulo: '📱 Promoção Instagram: 30% OFF em Produtos Gaming',
        url: 'https://www.instagram.com/p/ABC123/',
        tipo: 'promocao',
        categoria: 'Gaming',
        descricao: 'Promoção exclusiva no Instagram! 30% de desconto em produtos gaming selecionados.',
        plataforma: 'instagram',
        visualizacoes: 1250,
        curtidas: 89,
        compartilhamentos: 45,
        cidade: 'São Paulo',
        endereco: 'Loja Virtual'
      },
      {
        titulo: '🎮 Hardware Gaming - Stories do Instagram',
        url: 'https://www.instagram.com/stories/ABC123/',
        tipo: 'produto',
        categoria: 'Hardware',
        descricao: 'Confira nossos stories com as melhores ofertas de hardware gaming!',
        plataforma: 'instagram',
        visualizacoes: 890,
        curtidas: 67,
        compartilhamentos: 23,
        cidade: 'Rio de Janeiro',
        endereco: 'Loja Física - Centro'
      },
      {
        titulo: '🎧 Headset Gamer - Reels do Instagram',
        url: 'https://www.instagram.com/reel/ABC123/',
        tipo: 'produto',
        categoria: 'Periféricos',
        descricao: 'Reels exclusivos com nossos headsets gamer em ação!',
        plataforma: 'instagram',
        visualizacoes: 1560,
        curtidas: 123,
        compartilhamentos: 67,
        cidade: 'Belo Horizonte',
        endereco: 'Loja Virtual'
      },
      {
        titulo: '🖥️ Monitor Gaming - Live do Instagram',
        url: 'https://www.instagram.com/live/ABC123/',
        tipo: 'evento',
        categoria: 'Monitores',
        descricao: 'Live especial mostrando nossos monitores gaming em ação!',
        plataforma: 'instagram',
        visualizacoes: 2100,
        curtidas: 178,
        compartilhamentos: 89,
        cidade: 'Curitiba',
        endereco: 'Loja Física - Shopping'
      },
      {
        titulo: '🎮 Evento Gaming - Stories em Tempo Real',
        url: 'https://www.instagram.com/stories/ABC123/',
        tipo: 'evento',
        categoria: 'Eventos',
        descricao: 'Acompanhe nosso evento gaming em tempo real pelos stories!',
        plataforma: 'instagram',
        visualizacoes: 3200,
        curtidas: 245,
        compartilhamentos: 134,
        cidade: 'Porto Alegre',
        endereco: 'Centro de Eventos'
      }
    ]

    // Adicionar conteúdos para cada parceiro
    for (const parceiro of parceiros) {
      console.log(`\n🏢 Adicionando conteúdos do Instagram para ${parceiro.usuario.nome}...`)

      for (const conteudo of conteudosInstagram) {
        // Verificar se o conteúdo já existe
        const existing = await prisma.conteudoParceiro.findFirst({
          where: {
            parceiroId: parceiro.id,
            titulo: conteudo.titulo
          }
        })

        if (!existing) {
          await prisma.conteudoParceiro.create({
            data: {
              parceiroId: parceiro.id,
              titulo: conteudo.titulo,
              url: conteudo.url,
              tipo: conteudo.tipo,
              categoria: conteudo.categoria,
              descricao: conteudo.descricao,
              plataforma: conteudo.plataforma,
              visualizacoes: conteudo.visualizacoes,
              curtidas: conteudo.curtidas,
              compartilhamentos: conteudo.compartilhamentos,
              cidade: conteudo.cidade,
              endereco: conteudo.endereco,
              dataPublicacao: new Date()
            }
          })
          console.log(`✅ Conteúdo Instagram adicionado: ${conteudo.titulo}`)
        } else {
          console.log(`⚠️ Conteúdo já existe: ${conteudo.titulo}`)
        }
      }
    }

    // Estatísticas finais
    const totalConteudos = await prisma.conteudoParceiro.count()
    const totalConteudosInstagram = await prisma.conteudoParceiro.count({
      where: {
        plataforma: 'instagram'
      }
    })
    const totalVisualizacoes = await prisma.conteudoParceiro.aggregate({
      _sum: {
        visualizacoes: true
      }
    })

    console.log('\n🎉 Conteúdos do Instagram adicionados com sucesso para todos os parceiros!')
    console.log('📊 Estatísticas finais:')
    console.log(`- Total de parceiros: ${parceiros.length}`)
    console.log(`- Total de conteúdos: ${totalConteudos}`)
    console.log(`- Total de conteúdos Instagram: ${totalConteudosInstagram}`)
    console.log(`- Total de visualizações: ${totalVisualizacoes._sum.visualizacoes || 0}`)

  } catch (error) {
    console.error('❌ Erro ao adicionar conteúdos do Instagram dos parceiros:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addConteudosInstagramParceiros()
}

module.exports = { addConteudosInstagramParceiros }

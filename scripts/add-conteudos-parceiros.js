const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addConteudosParceiros() {
  try {
    console.log('🏢 Adicionando conteúdos para parceiros...')

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

    // Conteúdos de exemplo para parceiros
    const conteudosExemplo = [
      {
        titulo: '🎮 Promoção Especial: 50% OFF em Jogos',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        tipo: 'promocao',
        categoria: 'Gaming',
        descricao: 'Promoção especial para a comunidade SementesPLAY! 50% de desconto em jogos selecionados.',
        plataforma: 'youtube',
        visualizacoes: 850,
        curtidas: 67,
        compartilhamentos: 23,
        cidade: 'São Paulo',
        endereco: 'Loja Virtual'
      },
      {
        titulo: '💻 Hardware Gaming com Preços Imbatíveis',
        url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        tipo: 'produto',
        categoria: 'Hardware',
        descricao: 'Monte seu PC gamer com os melhores preços! Peças selecionadas com garantia.',
        plataforma: 'youtube',
        visualizacoes: 1200,
        curtidas: 89,
        compartilhamentos: 34,
        cidade: 'Rio de Janeiro',
        endereco: 'Loja Física - Centro'
      },
      {
        titulo: '🎧 Headset Gamer Profissional',
        url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        tipo: 'produto',
        categoria: 'Periféricos',
        descricao: 'Headset gamer profissional com qualidade de áudio excepcional. Ideal para streamers.',
        plataforma: 'youtube',
        visualizacoes: 650,
        curtidas: 45,
        compartilhamentos: 12,
        cidade: 'Belo Horizonte',
        endereco: 'Loja Virtual'
      },
      {
        titulo: '🖥️ Monitor Gaming 144Hz - Oferta Limitada',
        url: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
        tipo: 'promocao',
        categoria: 'Monitores',
        descricao: 'Monitor gaming 144Hz com preço especial para a comunidade SementesPLAY!',
        plataforma: 'youtube',
        visualizacoes: 980,
        curtidas: 78,
        compartilhamentos: 29,
        cidade: 'Curitiba',
        endereco: 'Loja Física - Shopping'
      },
      {
        titulo: '🎮 Evento Gaming: Lançamento de Produtos',
        url: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
        tipo: 'evento',
        categoria: 'Eventos',
        descricao: 'Evento especial de lançamento de novos produtos gaming! Presença confirmada.',
        plataforma: 'youtube',
        visualizacoes: 1500,
        curtidas: 123,
        compartilhamentos: 56,
        cidade: 'Porto Alegre',
        endereco: 'Centro de Eventos'
      }
    ]

    // Adicionar conteúdos para cada parceiro
    for (const parceiro of parceiros) {
      console.log(`\n🏢 Adicionando conteúdos para ${parceiro.usuario.nome}...`)

      for (const conteudo of conteudosExemplo) {
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
          console.log(`✅ Conteúdo adicionado: ${conteudo.titulo}`)
        } else {
          console.log(`⚠️ Conteúdo já existe: ${conteudo.titulo}`)
        }
      }
    }

    // Estatísticas finais
    const totalConteudos = await prisma.conteudoParceiro.count()
    const totalVisualizacoes = await prisma.conteudoParceiro.aggregate({
      _sum: {
        visualizacoes: true
      }
    })

    console.log('\n🎉 Conteúdos adicionados com sucesso para todos os parceiros!')
    console.log('📊 Estatísticas finais:')
    console.log(`- Total de parceiros: ${parceiros.length}`)
    console.log(`- Total de conteúdos: ${totalConteudos}`)
    console.log(`- Total de visualizações: ${totalVisualizacoes._sum.visualizacoes || 0}`)

  } catch (error) {
    console.error('❌ Erro ao adicionar conteúdos dos parceiros:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addConteudosParceiros()
}

module.exports = { addConteudosParceiros } 
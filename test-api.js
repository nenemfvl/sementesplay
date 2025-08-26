const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Simular a função de verificação do YouTube
async function verificarYouTubeLiveSimples(channelId) {
  try {
    console.log(`🔍 Verificando YouTube: ${channelId}`)
    
    // Extrair o username do URL
    const username = channelId.replace('https://www.youtube.com/@', '')
    console.log(`📺 Username extraído: ${username}`)
    
    // Simular verificação (sem fazer requisição real)
    console.log('✅ YouTube verificado (simulado)')
    return {
      isLive: true,
      title: 'Teste de Live - SementesPLAY',
      viewers: 150
    }
  } catch (error) {
    console.error('❌ Erro YouTube:', error)
    return { isLive: false }
  }
}

async function testSalonAPI() {
  try {
    console.log('🎭 Testando API do Salão...\n')
    
    // 1. Buscar criadores como na API original
    const criadores = await prisma.criador.findMany({
      where: {
        usuario: {
          nivel: {
            in: ['criador-supremo', 'criador-parceiro', 'criador-comum', 'criador-iniciante']
          }
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            sementes: true,
            avatarUrl: true,
            nivel: true
          }
        }
      }
    })
    
    console.log(`📊 Criadores encontrados na consulta: ${criadores.length}`)
    
    if (criadores.length === 0) {
      console.log('❌ Nenhum criador encontrado na consulta principal')
      
      // Verificar todos os criadores
      const todosCriadores = await prisma.criador.findMany({
        include: { usuario: true }
      })
      console.log(`\n🔍 Total de criadores na tabela: ${todosCriadores.length}`)
      
      todosCriadores.forEach((c, i) => {
        console.log(`\nCriador ${i + 1}:`)
        console.log(`  - ID: ${c.id}`)
        console.log(`  - Nome: ${c.nome}`)
        console.log(`  - Usuario ID: ${c.usuarioId}`)
        console.log(`  - Nivel do usuario: ${c.usuario?.nivel}`)
        console.log(`  - Redes sociais: ${c.redesSociais}`)
      })
      
      return
    }
    
    // 2. Processar cada criador
    const criadoresComLives = []
    
    for (const criador of criadores) {
      console.log(`\n🎯 Processando criador: ${criador.nome}`)
      
      let redesSociais = {
        youtube: '',
        twitch: '',
        instagram: '',
        tiktok: '',
        twitter: ''
      }
      
      try {
        if (criador.redesSociais) {
          const redes = JSON.parse(criador.redesSociais)
          redesSociais = { ...redesSociais, ...redes }
          console.log(`  📱 Redes sociais:`, redesSociais)
        }
      } catch (error) {
        console.log(`  ❌ Erro ao processar redes sociais:`, error.message)
      }
      
      const plataformasLive = []
      
      // Verificar YouTube
      if (redesSociais.youtube) {
        console.log(`  🎥 Verificando YouTube: ${redesSociais.youtube}`)
        const youtubeStatus = await verificarYouTubeLiveSimples(redesSociais.youtube)
        if (youtubeStatus.isLive) {
          plataformasLive.push({
            plataforma: 'YouTube',
            titulo: youtubeStatus.title,
            espectadores: youtubeStatus.viewers,
            url: redesSociais.youtube
          })
          console.log(`  ✅ YouTube ao vivo: ${youtubeStatus.title}`)
        }
      }
      
      if (plataformasLive.length > 0) {
        const mapearNivel = (nivel) => {
          switch (nivel) {
            case 'criador-iniciante': return 'Criador Iniciante'
            case 'criador-comum': return 'Criador Comum'
            case 'criador-parceiro': return 'Criador Parceiro'
            case 'criador-supremo': return 'Criador Supremo'
            default: return 'Criador'
          }
        }
        
        criadoresComLives.push({
          id: criador.id,
          usuarioId: criador.usuario.id,
          nome: criador.usuario.nome,
          email: criador.usuario.email,
          bio: criador.bio || 'Criador de conteúdo da comunidade SementesPLAY',
          avatar: criador.usuario.avatarUrl || '/avatars/default.jpg',
          categoria: criador.categoria || 'Geral',
          nivel: mapearNivel(criador.usuario.nivel),
          seguidores: criador.apoiadores || 0,
          doacoesRecebidas: criador.doacoes || 0,
          totalSementes: criador.usuario.sementes,
          redesSociais,
          plataformasLive,
          totalEspectadores: plataformasLive.reduce((sum, p) => sum + (p.espectadores || 0), 0)
        })
        
        console.log(`  🎉 Criador adicionado à lista de lives!`)
      } else {
        console.log(`  ⏸️ Nenhuma plataforma ao vivo encontrada`)
      }
    }
    
    console.log(`\n🎭 RESULTADO FINAL:`)
    console.log(`Criadores com lives: ${criadoresComLives.length}`)
    console.log(`Dados:`, JSON.stringify(criadoresComLives, null, 2))
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSalonAPI()

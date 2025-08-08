const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarResetCiclo() {
  try {
    console.log('🧪 Testando sistema de reset de ciclo/season...\n')

    // 1. Verificar estado atual
    console.log('1️⃣ Estado atual do sistema:')
    
    const config = await prisma.configuracaoCiclos.findFirst()
    console.log(`   📅 Ciclo atual: #${config?.numeroCiclo || 'N/A'}`)
    console.log(`   📅 Season atual: S${config?.numeroSeason || 'N/A'}`)
    
    const criadores = await prisma.usuario.findMany({
      where: {
        nivel: {
          in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
        }
      },
      select: {
        id: true,
        nome: true,
        nivel: true
      }
    })
    console.log(`   👥 Criadores encontrados: ${criadores.length}`)
    criadores.forEach(c => console.log(`      - ${c.nome}: ${c.nivel}`))
    
    const conteudos = await prisma.conteudo.count()
    const conteudosParceiros = await prisma.conteudoParceiro.count()
    console.log(`   📝 Conteúdos: ${conteudos}`)
    console.log(`   📝 Conteúdos de parceiros: ${conteudosParceiros}`)

    // 2. Simular reset forçando data antiga
    console.log('\n2️⃣ Simulando reset de ciclo...')
    
    if (config) {
      // Força uma data antiga para triggerar o reset
      const dataAntiga = new Date()
      dataAntiga.setDate(dataAntiga.getDate() - 20) // 20 dias atrás
      
      await prisma.configuracaoCiclos.update({
        where: { id: config.id },
        data: {
          dataInicioCiclo: dataAntiga
        }
      })
      
      console.log('   ✅ Data de início alterada para triggerar reset')
    }

    // 3. Chamar a API que fará o reset
    console.log('\n3️⃣ Chamando API de ciclos para executar reset...')
    
    const response = await fetch('http://localhost:3000/api/ranking/ciclos')
    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ Reset executado com sucesso!')
      console.log(`   📊 Resultado: ${JSON.stringify(data, null, 2)}`)
    } else {
      console.log('   ❌ Erro na API:', response.status)
    }

    // 4. Verificar resultado
    console.log('\n4️⃣ Verificando resultado do reset:')
    
    const criadoresAposReset = await prisma.usuario.findMany({
      where: {
        nivel: {
          in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
        }
      },
      select: {
        id: true,
        nome: true,
        nivel: true
      }
    })
    
    console.log(`   👥 Criadores após reset: ${criadoresAposReset.length}`)
    criadoresAposReset.forEach(c => console.log(`      - ${c.nome}: ${c.nivel}`))
    
    const conteudosAposReset = await prisma.conteudo.count()
    const conteudosParceiroAposReset = await prisma.conteudoParceiro.count()
    console.log(`   📝 Conteúdos após reset: ${conteudosAposReset}`)
    console.log(`   📝 Conteúdos de parceiros após reset: ${conteudosParceiroAposReset}`)

    console.log('\n✅ Teste concluído!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testarResetCiclo()
}

module.exports = { testarResetCiclo }

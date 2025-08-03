const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testarApiNotificacoes() {
  try {
    console.log('🔍 Testando API de notificações...')
    
    // Testar com um usuário que sabemos que tem notificações
    const usuarioId = 'cmdqhd1p20000jy04cdq5uo50' // flavia
    
    const response = await fetch(`http://localhost:3000/api/notificacoes?usuarioId=${usuarioId}`)
    const data = await response.json()
    
    console.log('📡 Status da resposta:', response.status)
    console.log('📋 Dados recebidos:', JSON.stringify(data, null, 2))
    
    if (response.ok && data.notificacoes) {
      console.log(`✅ Encontradas ${data.notificacoes.length} notificações para o usuário ${usuarioId}`)
      
      if (data.notificacoes.length > 0) {
        console.log('\n📋 Primeira notificação:')
        const primeira = data.notificacoes[0]
        console.log(`   ID: ${primeira.id}`)
        console.log(`   Título: ${primeira.titulo}`)
        console.log(`   Mensagem: ${primeira.mensagem}`)
        console.log(`   Tipo: ${primeira.tipo}`)
        console.log(`   Lida: ${primeira.lida}`)
      }
    } else {
      console.log('❌ Erro na API:', data.error || 'Resposta inválida')
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message)
  }
}

testarApiNotificacoes() 
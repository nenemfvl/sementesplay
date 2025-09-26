const fetch = require('node-fetch')

async function testAPI() {
  try {
    console.log('🔗 Testando endpoint da API...')
    
    // Criar um usuário admin fake para teste
    const adminUser = {
      id: 'test-admin',
      nome: 'Admin Test',
      nivel: 5
    }
    
    const token = Buffer.from(JSON.stringify(adminUser)).toString('base64')
    
    console.log('🔑 Token criado:', token)
    
    const response = await fetch('http://localhost:3000/api/admin/criadores', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('📡 Status da resposta:', response.status)
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers))
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Dados recebidos:', JSON.stringify(data, null, 2))
    } else {
      const errorText = await response.text()
      console.log('❌ Erro na resposta:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 O servidor Next.js não está rodando. Inicie com: npm run dev')
    }
  }
}

testAPI()

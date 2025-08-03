const fetch = require('node-fetch')

async function testarAPIXP() {
  try {
    const userId = 'cmdqhksir0000l804cxot2lvi'
    
    console.log('Testando API de XP...')
    console.log(`User ID: ${userId}`)
    
    const response = await fetch('http://localhost:3000/api/usuario/xp', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userId}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Resposta da API:')
      console.log(JSON.stringify(data, null, 2))
    } else {
      const error = await response.text()
      console.log('Erro da API:')
      console.log(error)
    }
    
  } catch (error) {
    console.error('Erro ao testar API:', error)
  }
}

testarAPIXP() 
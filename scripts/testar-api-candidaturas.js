// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const fetch = require('node-fetch')

// async function testarAPICandidaturas() {
  try {
    console.log('Testando API de candidaturas...')
    
    // Simular um usuário admin (nível 5)
    const mockUser = {
      id: '1',
      nome: 'Admin Teste',
      email: 'admin@sementesplay.com',
      nivel: '5',
      tipo: 'admin'
    }
    
    // Simular localStorage
    global.localStorage = {
      getItem: (key) => {
        if (key === 'sementesplay_user') {
          return JSON.stringify(mockUser)
        }
        return null
      }
    }
    
    // Fazer requisição para a API
    const response = await fetch('http://localhost:3000/api/admin/candidaturas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Status da resposta:', response.status)
    console.log('Headers:', response.headers.raw())
    
    const data = await response.json()
    console.log('Dados da resposta:', JSON.stringify(data, null, 2))
    
//   } catch (error) {
//     console.error('Erro ao testar API:', error)
//   }
// }

// testarAPICandidaturas() 
// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const fetch = require('node-fetch')

// async function testarApiRepasses() {
  try {
    console.log('🧪 Testando API de repasses pendentes...')
    
    // ID do usuário parceiro (costaoeste)
    const usuarioId = 'cmdqhi5ft0000jo04981xsxry' // ID do parceiro costaoeste
    
    const response = await fetch(`https://sementesplay.vercel.app/api/parceiros/repasses-pendentes?usuarioId=${usuarioId}`)
    
    console.log('📡 Status da resposta:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API funcionando!')
      console.log('📊 Dados retornados:', data.length, 'itens')
      
      data.forEach((item, index) => {
        console.log(`\n${index + 1}. Item:`)
        console.log(`   ID: ${item.id}`)
        console.log(`   Tipo: ${item.tipo}`)
        console.log(`   Status: ${item.status}`)
        console.log(`   Valor Compra: R$ ${item.valorCompra}`)
        console.log(`   Valor Repasse: R$ ${item.valorRepasse}`)
        console.log(`   Usuário: ${item.usuario.nome}`)
        console.log(`   Comprovante: ${item.comprovante ? 'Sim' : 'Não'}`)
      })
    } else {
      const error = await response.json()
      console.log('❌ Erro na API:', error)
    }
    
//   } catch (error) {
//     console.error('❌ Erro ao testar API:', error)
//   }
// }

// testarApiRepasses() 
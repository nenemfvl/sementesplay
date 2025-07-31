const fs = require('fs')
const path = require('path')

async function testarUpload() {
  try {
    console.log('🧪 Testando upload para Cloudinary...')
    
    // Simular uma imagem base64 (pequena)
    const imagemBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    
    const response = await fetch('https://sementesplay.vercel.app/api/upload-comprovante', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imagemBase64
      })
    })
    
    console.log('📡 Status da resposta:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Upload realizado com sucesso!')
      console.log('📄 URL:', data.url)
      console.log('🆔 Public ID:', data.public_id)
    } else {
      const error = await response.json()
      console.log('❌ Erro no upload:', error)
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar upload:', error)
  }
}

testarUpload() 
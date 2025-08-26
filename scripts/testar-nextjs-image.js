const https = require('https');

// Função para fazer requisição HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function testarNextJSImage() {
  console.log('🔍 Testando Next.js Image Component...\n');
  
  // Testar diferentes formatos de URL
  const testCases = [
    {
      name: 'YouTube Thumbnail',
      url: 'https://sementesplay.com.br/next/image?url=https%3A%2F%2Fimg.youtube.com%2Fvi%2FdQw4w9WgXcQ%2Fhqdefault.jpg&w=640&q=75'
    },
    {
      name: 'Twitch Live Preview',
      url: 'https://sementesplay.com.br/next/image?url=https%3A%2F%2Fstatic-cdn.jtvnw.net%2Fpreviews-ttv%2Flive_user_test.jpg&w=640&q=75'
    },
    {
      name: 'URL simples sem parâmetros',
      url: 'https://sementesplay.com.br/next/image?url=https%3A%2F%2Fimg.youtube.com%2Fvi%2FdQw4w9WgXcQ%2Fhqdefault.jpg'
    }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`📸 ${testCase.name}`);
      console.log(`   URL: ${testCase.url}`);
      
      const result = await makeRequest(testCase.url);
      
      console.log(`   Status: ${result.status}`);
      console.log(`   Content-Type: ${result.headers['content-type'] || 'N/A'}`);
      console.log(`   Content-Length: ${result.headers['content-length'] || 'N/A'}`);
      
      if (result.status === 200) {
        console.log('   ✅ Funcionando\n');
      } else {
        console.log('   ❌ Problema detectado');
        console.log(`   Resposta: ${result.data.substring(0, 200)}...\n`);
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
    }
  }
  
  // Testar se o servidor está respondendo
  console.log('🌐 Testando se o servidor está respondendo...\n');
  
  try {
    const result = await makeRequest('https://sementesplay.com.br/');
    console.log(`   Status da página principal: ${result.status}`);
    console.log(`   Servidor respondendo: ${result.status === 200 ? '✅ Sim' : '❌ Não'}\n`);
  } catch (error) {
    console.log(`   ❌ Erro ao acessar servidor: ${error.message}\n`);
  }
}

testarNextJSImage().catch(console.error);

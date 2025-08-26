// Usar fetch nativo do Node.js 18+ ou importar node-fetch
let fetch;

try {
  // Node.js 18+ tem fetch nativo
  fetch = globalThis.fetch;
} catch {
  // Fallback para versões mais antigas
  fetch = require('node-fetch');
}

// URLs de teste baseadas nos erros do console
const urlsParaTestar = [
  'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  'https://static-cdn.jtvnw.net/previews-ttv/live_user_test.jpg',
  'https://static-cdn.jtvnw.net/videos_capture/123456.jpg'
];

async function testarURLs() {
  console.log('🔍 Testando URLs de imagens...\n');
  
  for (const url of urlsParaTestar) {
    try {
      console.log(`📸 Testando: ${url}`);
      
      const response = await fetch(url);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      console.log(`   Content-Length: ${response.headers.get('content-length') || 'N/A'}`);
      
      if (response.ok) {
        console.log('   ✅ URL válida\n');
      } else {
        console.log('   ❌ URL inválida\n');
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
    }
  }
  
  // Testar URLs específicas que podem estar causando problemas
  console.log('🔍 Testando URLs específicas do sistema...\n');
  
  const urlsEspecificas = [
    'https://sementesplay.com.br/next/image?url=https%3A%2F%2Fstatic-cdn.jtvnw.net%2Fpreviews-ttv%2Flive_user_test.jpg',
    'https://sementesplay.com.br/next/image?url=https%3A%2F%2Fimg.youtube.com%2Fvi%2FdQw4w9WgXcQ%2Fhqdefault.jpg'
  ];
  
  for (const url of urlsEspecificas) {
    try {
      console.log(`🌐 Testando Next.js Image: ${url}`);
      
      const response = await fetch(url);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        console.log('   ✅ Next.js Image funcionando\n');
      } else {
        console.log('   ❌ Next.js Image com problema\n');
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
    }
  }
}

testarURLs().catch(console.error);

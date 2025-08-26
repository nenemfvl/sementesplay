const fetch = require('node-fetch');

async function testarAPI() {
  console.log('🧪 Testando API de conteúdos dos parceiros...');
  
  try {
    const response = await fetch('http://localhost:3000/api/parceiros/conteudos');
    console.log('📡 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Dados recebidos:');
      console.log('- Success:', data.success);
      console.log('- Conteúdos encontrados:', data.conteudos?.length || 0);
      
      if (data.conteudos && data.conteudos.length > 0) {
        console.log('\n🎯 Primeiro conteúdo:');
        const primeiro = data.conteudos[0];
        console.log('- ID:', primeiro.id);
        console.log('- Título:', primeiro.titulo);
        console.log('- URL:', primeiro.url);
        console.log('- Tipo:', primeiro.tipo);
        console.log('- Parceiro:', primeiro.parceiro?.nome);
        console.log('- Visualizações:', primeiro.visualizacoes);
      }
    } else {
      console.log('❌ Erro na resposta:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testarAPI();

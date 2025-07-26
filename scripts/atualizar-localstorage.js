// Script para atualizar o localStorage do usuário
// Execute este script no console do navegador

function atualizarLocalStorage() {
  // Buscar dados do usuário atual no localStorage
  const userData = localStorage.getItem('user');
  
  if (userData) {
    const user = JSON.parse(userData);
    console.log('Usuário atual:', user);
    
    // Atualizar o nível para criador-supremo
    user.nivel = 'criador-supremo';
    
    // Salvar de volta no localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('LocalStorage atualizado:', user);
    console.log('Recarregue a página para ver as mudanças');
  } else {
    console.log('Nenhum usuário encontrado no localStorage');
  }
}

// Executar a função
atualizarLocalStorage(); 
const fs = require('fs');
const path = require('path');

// Padrões de headers duplicados para remover
const headerPatterns = [
  // Header com logo SementesPLAY
  {
    pattern: /(\s*)\{\/\* Header \*\/\s*<header className="bg-sss-medium shadow-lg border-b border-sss-light">\s*<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\s*<div className="flex justify-between items-center py-4">\s*<div className="flex items-center space-x-4">\s*<Link href="[^"]*" className="inline-flex items-center text-sss-accent hover:text-red-400">\s*<ArrowLeftIcon className="w-5 h-5 mr-2" \/>\s*[^<]*<\/Link>\s*<\/div>\s*<div className="flex items-center space-x-4">\s*<div className="w-10 h-10 bg-[^"]* rounded-full flex items-center justify-center">\s*<span className="text-lg">🌱<\/span>\s*<\/div>\s*<div>\s*<h1 className="text-xl font-bold text-sss-white">SementesPLAY<\/h1>\s*<p className="text-sm text-gray-300">[^<]*<\/p>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/header>/g,
    replacement: ''
  },
  // Header simples com SementesPLAY
  {
    pattern: /(\s*)\{\/\* Header \*\/\s*<header className="bg-black shadow-lg border-b border-sss-light sticky top-0 z-50 relative">\s*<button[^>]*>\s*<span className="text-2xl text-sss-accent">🌱<\/span>\s*<span className="text-xl font-bold text-sss-accent">SementesPLAY<\/span>\s*<\/button>\s*<\/header>/g,
    replacement: ''
  },
  // Header com analytics
  {
    pattern: /(\s*)\{\/\* Header \*\/\s*<header className="bg-sss-medium shadow-lg border-b border-sss-light">\s*<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">\s*<div className="flex justify-between items-center py-4">\s*<div className="flex items-center space-x-4">\s*<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">\s*<ChartBarIcon className="w-6 h-6 text-white" \/>\s*<\/div>\s*<div>\s*<h1 className="text-xl font-bold text-sss-white">Analytics<\/h1>\s*<p className="text-sm text-gray-300">Business Intelligence & Insights<\/p>\s*<\/div>\s*<\/div>\s*<div className="flex items-center space-x-4">\s*\{\/\* Filtro de período \*\/\s*<div className="flex items-center space-x-2 bg-sss-light rounded-lg p-1">\s*\{TIME_RANGES\.map\(\(range\) => \([\s\S]*?\)\)\}\s*<\/div>\s*\{\/\* Botão de exportar \*\/\s*<button[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/header>/g,
    replacement: ''
  }
];

// Função para processar um arquivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;

    // Aplicar cada padrão
    headerPatterns.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        changes += matches.length;
      }
    });

    // Se houve mudanças, salvar o arquivo
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath} - ${changes} header(s) removido(s)`);
      return true;
    } else {
      console.log(`⏭️  ${filePath} - Nenhum header duplicado encontrado`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função para processar diretório recursivamente
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalChanges = 0;

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      totalChanges += processDirectory(filePath);
    } else if (file.endsWith('.tsx') && file !== '_app.tsx') {
      if (processFile(filePath)) {
        totalChanges++;
      }
    }
  });

  return totalChanges;
}

// Executar o script
console.log('🚀 Iniciando remoção de headers duplicados...\n');

const pagesDir = path.join(__dirname, '..', 'pages');
const totalFilesChanged = processDirectory(pagesDir);

console.log(`\n🎉 Processo concluído!`);
console.log(`📁 Total de arquivos modificados: ${totalFilesChanged}`);
console.log(`✨ Headers duplicados removidos com sucesso!`);
console.log(`\n💡 Agora todas as páginas usam apenas a navbar global do _app.tsx`);

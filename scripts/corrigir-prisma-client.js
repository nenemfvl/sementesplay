const fs = require('fs');
const path = require('path');

// Função para corrigir um arquivo
function corrigirArquivo(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modificado = false;

    // Verificar se o arquivo usa new PrismaClient()
    if (content.includes('new PrismaClient()')) {
      console.log(`🔧 Corrigindo: ${filePath}`);

      // Remover import do PrismaClient
      content = content.replace(
        /import\s+\{\s*PrismaClient\s*\}\s+from\s+['"]@prisma\/client['"];?\s*\n/g,
        ''
      );

      // Remover const prisma = new PrismaClient()
      content = content.replace(
        /const\s+prisma\s*=\s*new\s+PrismaClient\(\)\s*\n/g,
        ''
      );

      // Adicionar import da instância compartilhada
      const relativePath = path.relative(path.dirname(filePath), 'lib/prisma').replace(/\\/g, '/');
      const importStatement = `import { prisma } from '${relativePath.startsWith('.') ? relativePath : `./${relativePath}`}'\n\n`;
      
      // Encontrar a posição correta para inserir o import
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Procurar por imports existentes
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') || lines[i].startsWith('const ') || lines[i].startsWith('function ') || lines[i].startsWith('export ')) {
          insertIndex = i;
          break;
        }
      }

      // Inserir o import
      lines.splice(insertIndex, 0, importStatement);
      content = lines.join('\n');

      modificado = true;
    }

    if (modificado) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error.message);
    return false;
  }
}

// Função para processar diretório recursivamente
function processarDiretorio(dir) {
  const arquivos = fs.readdirSync(dir);
  let corrigidos = 0;

  for (const arquivo of arquivos) {
    const caminhoCompleto = path.join(dir, arquivo);
    const stat = fs.statSync(caminhoCompleto);

    if (stat.isDirectory()) {
      corrigidos += processarDiretorio(caminhoCompleto);
    } else if (arquivo.endsWith('.ts') || arquivo.endsWith('.js')) {
      if (corrigirArquivo(caminhoCompleto)) {
        corrigidos++;
      }
    }
  }

  return corrigidos;
}

// Executar correção
console.log('🚀 Iniciando correção das APIs...');
const totalCorrigidos = processarDiretorio('pages/api');
console.log(`\n✅ Correção concluída! ${totalCorrigidos} arquivos corrigidos.`);

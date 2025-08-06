// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { spawn } = require('child_process');
// const path = require('path');

// console.log('🚀 Iniciando Prisma Studio...');
// console.log('📊 Acesse: http://localhost:5555');
// console.log('⏹️  Para parar: Ctrl+C');

// // Inicia o Prisma Studio
// const studio = spawn('npx', ['prisma', 'studio'], {
//   stdio: 'inherit',
//   shell: true,
//   cwd: path.join(__dirname, '..')
// });

// // Tratamento de erros
// studio.on('error', (error) => {
//   console.error('❌ Erro ao iniciar Prisma Studio:', error);
// });

// // Tratamento de saída
// studio.on('close', (code) => {
//   if (code !== 0) {
//     console.log(`❌ Prisma Studio fechou com código: ${code}`);
//   }
// });

// // Graceful shutdown
// process.on('SIGINT', () => {
//   console.log('\n🛑 Parando Prisma Studio...');
//   studio.kill('SIGINT');
//   process.exit(0);
// });

// process.on('SIGTERM', () => {
//   console.log('\n🛑 Parando Prisma Studio...');
//   studio.kill('SIGTERM');
//   process.exit(0);
// }); 
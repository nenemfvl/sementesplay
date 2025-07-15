import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StatisticsService } from './statistics.service';
import { RankingService } from './ranking.service';
import { ConquistaService } from './conquista.service';
import { FavoritoService } from './favorito.service';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userService = app.get(UserService);
  const statisticsService = app.get(StatisticsService);
  const rankingService = app.get(RankingService);
  const conquistaService = app.get(ConquistaService);
  const favoritoService = app.get(FavoritoService);

  console.log('🚀 Inicializando banco de dados...');

  try {
    // Criar usuários de exemplo
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const hashedPassword = await bcrypt.hash('senha123', 10);
      const user = await userService.create(`user${i}@example.com`, hashedPassword);
      users.push(user);
      console.log(`✅ Usuário ${i} criado: ${user.email}`);
    }

    // Criar estatísticas para cada usuário
    for (const user of users) {
      await statisticsService.createStatistics(user.id);
      console.log(`✅ Estatísticas criadas para ${user.email}`);
    }

    // Atualizar rankings
    await rankingService.updateRankings();
    console.log('✅ Rankings atualizados');

    // Criar conquistas de exemplo (usando o primeiro usuário como referência)
    const conquistas = [
      { titulo: 'Primeira Live', descricao: 'Realize sua primeira transmissão', icone: '🎥' },
      { titulo: '100 Seguidores', descricao: 'Alcance 100 seguidores', icone: '👥' },
      { titulo: '1000 Visualizações', descricao: 'Alcance 1000 visualizações totais', icone: '👁️' },
      { titulo: 'Streamer Ativo', descricao: 'Faça 10 streams', icone: '📺' },
      { titulo: 'Engajamento Alto', descricao: 'Alcance 5% de taxa de engajamento', icone: '📈' },
      { titulo: 'Comunidade', descricao: 'Receba 500 comentários', icone: '💬' },
    ];

    for (const conquista of conquistas) {
      await conquistaService.addConquista(users[0], conquista);
    }
    console.log('✅ Conquistas criadas');

    // Criar favoritos de exemplo (usando o primeiro usuário como referência)
    const favoritos = [
      { nome: 'Twitch', avatar: '🟣', categoria: 'Plataforma', online: true, seguidores: 1000000 },
      { nome: 'YouTube', avatar: '🔴', categoria: 'Plataforma', online: true, seguidores: 2000000 },
      { nome: 'Discord', avatar: '💬', categoria: 'Comunidade', online: true, seguidores: 500000 },
      { nome: 'OBS Studio', avatar: '🎬', categoria: 'Software', online: false, seguidores: 0 },
      { nome: 'Streamlabs', avatar: '🎯', categoria: 'Ferramentas', online: true, seguidores: 300000 },
      { nome: 'Elgato', avatar: '🎮', categoria: 'Hardware', online: false, seguidores: 0 },
    ];

    for (const favorito of favoritos) {
      await favoritoService.addFavorito(users[0], favorito);
    }
    console.log('✅ Favoritos criados');

    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('📧 Emails de teste: user1@example.com até user5@example.com');
    console.log('🔑 Senha: senha123');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 
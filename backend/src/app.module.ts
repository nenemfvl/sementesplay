import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user.entity';
import { UserService } from './user.service';
import { AuthController } from './auth.controller';
import { Conquista } from './conquista.entity';
import { ConquistaService } from './conquista.service';
import { ConquistaController } from './conquista.controller';
import { Favorito } from './favorito.entity';
import { FavoritoService } from './favorito.service';
import { FavoritoController } from './favorito.controller';
import { Statistics } from './entities/statistics.entity';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Ranking } from './entities/ranking.entity';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'sementesplay.db',
      entities: [User, Conquista, Favorito, Statistics, Ranking],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Conquista, Favorito, Statistics, Ranking]),
  ],
  controllers: [
    AppController,
    AuthController,
    ConquistaController,
    FavoritoController,
    StatisticsController,
    RankingController,
  ],
  providers: [
    AppService,
    UserService,
    ConquistaService,
    FavoritoService,
    StatisticsService,
    RankingService,
  ],
})
export class AppModule {} 
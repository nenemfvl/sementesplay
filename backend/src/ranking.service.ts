import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ranking } from './entities/ranking.entity';
import { Statistics } from './entities/statistics.entity';
import { User } from './user.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(Ranking)
    private rankingRepository: Repository<Ranking>,
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async updateRankings(): Promise<void> {
    const categories = ['totalViews', 'totalFollowers', 'totalLikes', 'totalStreams', 'engagementRate'];
    
    for (const category of categories) {
      const statistics = await this.statisticsRepository.find({
        relations: ['user'],
        order: { [category]: 'DESC' },
      });

      // Limpar rankings existentes para esta categoria
      await this.rankingRepository.delete({ category });

      // Criar novos rankings
      for (let i = 0; i < statistics.length; i++) {
        const stat = statistics[i];
        const previousRanking = await this.rankingRepository.findOne({
          where: { userId: stat.userId, category },
        });

        const ranking = this.rankingRepository.create({
          userId: stat.userId,
          category,
          position: i + 1,
          score: stat[category],
          previousPosition: previousRanking?.position || 0,
          change: previousRanking ? previousRanking.position - (i + 1) : 0,
        });

        await this.rankingRepository.save(ranking);
      }
    }
  }

  async getRankings(category: string = 'totalViews', limit: number = 10): Promise<Ranking[]> {
    return this.rankingRepository.find({
      where: { category },
      relations: ['user'],
      order: { position: 'ASC' },
      take: limit,
    });
  }

  async getUserRanking(userId: number, category: string = 'totalViews'): Promise<Ranking> {
    return this.rankingRepository.findOne({
      where: { userId, category },
      relations: ['user'],
    });
  }

  async getAllUserRankings(userId: number): Promise<Ranking[]> {
    return this.rankingRepository.find({
      where: { userId },
      relations: ['user'],
      order: { category: 'ASC' },
    });
  }

  async getTopRankings(limit: number = 10): Promise<{ [category: string]: Ranking[] }> {
    const categories = ['totalViews', 'totalFollowers', 'totalLikes', 'totalStreams', 'engagementRate'];
    const result = {};

    for (const category of categories) {
      result[category] = await this.getRankings(category, limit);
    }

    return result;
  }
} 
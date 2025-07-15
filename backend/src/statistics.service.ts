import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistics } from './entities/statistics.entity';
import { User } from './user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createStatistics(userId: number): Promise<Statistics> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const statistics = this.statisticsRepository.create({
      userId,
      totalViews: Math.floor(Math.random() * 10000) + 1000,
      totalLikes: Math.floor(Math.random() * 5000) + 500,
      totalComments: Math.floor(Math.random() * 2000) + 200,
      totalShares: Math.floor(Math.random() * 1000) + 100,
      totalFollowers: Math.floor(Math.random() * 5000) + 1000,
      totalStreams: Math.floor(Math.random() * 100) + 10,
      totalHoursStreamed: Math.floor(Math.random() * 500) + 50,
      averageViewers: Math.random() * 1000 + 100,
      engagementRate: Math.random() * 10 + 2,
    });

    return this.statisticsRepository.save(statistics);
  }

  async getUserStatistics(userId: number): Promise<Statistics> {
    let statistics = await this.statisticsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!statistics) {
      statistics = await this.createStatistics(userId);
    }

    return statistics;
  }

  async updateStatistics(userId: number, updates: Partial<Statistics>): Promise<Statistics> {
    const statistics = await this.getUserStatistics(userId);
    Object.assign(statistics, updates);
    return this.statisticsRepository.save(statistics);
  }

  async getTopStatistics(category: string, limit: number = 10): Promise<Statistics[]> {
    const orderBy = {
      totalViews: 'totalViews',
      totalFollowers: 'totalFollowers',
      totalLikes: 'totalLikes',
      totalStreams: 'totalStreams',
      engagementRate: 'engagementRate',
    }[category] || 'totalViews';

    return this.statisticsRepository.find({
      relations: ['user'],
      order: { [orderBy]: 'DESC' },
      take: limit,
    });
  }
} 
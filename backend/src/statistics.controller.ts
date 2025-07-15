import { Controller, Get, Post, Put, Body, Param, Request } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = 'sementesplay_secret';

function getUserIdFromRequest(req: Request): number | null {
  const auth = req.headers['authorization'];
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload.sub;
  } catch {
    return null;
  }
}

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('user')
  async getUserStatistics(@Request() req) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new Error('Não autenticado');
    return this.statisticsService.getUserStatistics(userId);
  }

  @Get('top/:category')
  async getTopStatistics(@Param('category') category: string) {
    return this.statisticsService.getTopStatistics(category, 10);
  }

  @Put('user')
  async updateUserStatistics(@Request() req, @Body() updates: any) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new Error('Não autenticado');
    return this.statisticsService.updateStatistics(userId, updates);
  }

  @Post('generate')
  async generateStatistics(@Request() req) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new Error('Não autenticado');
    return this.statisticsService.createStatistics(userId);
  }
} 
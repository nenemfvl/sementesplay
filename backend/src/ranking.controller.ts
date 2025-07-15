import { Controller, Get, Post, Param, Request } from '@nestjs/common';
import { RankingService } from './ranking.service';
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

@Controller('rankings')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  async getAllRankings() {
    return this.rankingService.getTopRankings(10);
  }

  @Get(':category')
  async getRankingsByCategory(@Param('category') category: string) {
    return this.rankingService.getRankings(category, 10);
  }

  @Get('user/:category')
  async getUserRanking(@Request() req, @Param('category') category: string) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new Error('Não autenticado');
    return this.rankingService.getUserRanking(userId, category);
  }

  @Get('user/all')
  async getAllUserRankings(@Request() req) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new Error('Não autenticado');
    return this.rankingService.getAllUserRankings(userId);
  }

  @Post('update')
  async updateRankings() {
    await this.rankingService.updateRankings();
    return { message: 'Rankings atualizados com sucesso' };
  }
} 
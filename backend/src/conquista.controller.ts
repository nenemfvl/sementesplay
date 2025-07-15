import { Controller, Get, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { ConquistaService } from './conquista.service';
import { UserService } from './user.service';
import { Request } from 'express';
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

@Controller('conquistas')
export class ConquistaController {
  constructor(
    private readonly conquistaService: ConquistaService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getConquistas(@Req() req: Request) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new BadRequestException('Não autenticado');
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Usuário não encontrado');
    return this.conquistaService.findAllByUser(user);
  }

  @Post()
  async addConquista(@Req() req: Request, @Body() body: { titulo: string; descricao: string; icone?: string }) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new BadRequestException('Não autenticado');
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Usuário não encontrado');
    return this.conquistaService.addConquista(user, body);
  }
} 
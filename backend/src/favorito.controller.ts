import { Controller, Get, Post, Delete, Body, Req, Param, BadRequestException } from '@nestjs/common';
import { FavoritoService } from './favorito.service';
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

@Controller('favoritos')
export class FavoritoController {
  constructor(
    private readonly favoritoService: FavoritoService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getFavoritos(@Req() req: Request) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new BadRequestException('Não autenticado');
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Usuário não encontrado');
    return this.favoritoService.findAllByUser(user);
  }

  @Post()
  async addFavorito(@Req() req: Request, @Body() body: { nome: string; avatar?: string; categoria?: string; online?: boolean; seguidores?: number }) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new BadRequestException('Não autenticado');
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Usuário não encontrado');
    return this.favoritoService.addFavorito(user, body);
  }

  @Delete(':id')
  async removeFavorito(@Req() req: Request, @Param('id') id: number) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new BadRequestException('Não autenticado');
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Usuário não encontrado');
    await this.favoritoService.removeFavorito(user, id);
    return { message: 'Favorito removido com sucesso!' };
  }
} 
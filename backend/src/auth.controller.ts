import { Controller, Post, Body, BadRequestException, Patch, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from './user.entity';
import { Request } from 'express';
import { extname } from 'path';
import { Express } from 'express';

const JWT_SECRET = 'sementesplay_secret'; // Em produção, use variável de ambiente

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

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string
  ): Promise<{ user: User }> {
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email já cadastrado');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userService.create(email, hashed);
    return { user };
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string
  ): Promise<{ token: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Credenciais inválidas');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new BadRequestException('Credenciais inválidas');
    }
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return { token };
  }

  @Patch('profile')
  async updateProfile(@Req() req: Request, @Body() body: { email?: string; nome?: string }) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new BadRequestException('Não autenticado');
    const user = await this.userService.updateUser(userId, body);
    return { user };
  }

  @Patch('password')
  async changePassword(@Req() req: Request, @Body() body: { atual: string; nova: string }) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new BadRequestException('Não autenticado');
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Usuário não encontrado');
    const valid = await bcrypt.compare(body.atual, user.password);
    if (!valid) throw new BadRequestException('Senha atual incorreta');
    const hashed = await bcrypt.hash(body.nova, 10);
    user.password = hashed;
    await this.userService.updateUser(userId, { password: hashed });
    return { message: 'Senha alterada com sucesso!' };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      }
    })
  }))
  async uploadAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const userId = getUserIdFromRequest(req);
    if (!userId) throw new BadRequestException('Não autenticado');
    if (!file) throw new BadRequestException('Arquivo não enviado');
    await this.userService.updateUser(userId, { avatar: `/uploads/avatars/${file.filename}` });
    return { url: `/uploads/avatars/${file.filename}` };
  }
} 
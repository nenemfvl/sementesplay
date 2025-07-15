import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from './favorito.entity';
import { User } from './user.entity';

@Injectable()
export class FavoritoService {
  constructor(
    @InjectRepository(Favorito)
    private favoritoRepository: Repository<Favorito>,
  ) {}

  async findAllByUser(user: User): Promise<Favorito[]> {
    return this.favoritoRepository.find({ where: { usuario: user } });
  }

  async addFavorito(user: User, data: { nome: string; avatar?: string; categoria?: string; online?: boolean; seguidores?: number }): Promise<Favorito> {
    const favorito = this.favoritoRepository.create({ ...data, usuario: user });
    return this.favoritoRepository.save(favorito);
  }

  async removeFavorito(user: User, id: number): Promise<void> {
    await this.favoritoRepository.delete({ id, usuario: user });
  }
} 
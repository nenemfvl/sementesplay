import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conquista } from './conquista.entity';
import { User } from './user.entity';

@Injectable()
export class ConquistaService {
  constructor(
    @InjectRepository(Conquista)
    private conquistaRepository: Repository<Conquista>,
  ) {}

  async findAllByUser(user: User): Promise<Conquista[]> {
    return this.conquistaRepository.find({ where: { usuario: user } });
  }

  async addConquista(user: User, data: { titulo: string; descricao: string; icone?: string }): Promise<Conquista> {
    const conquista = this.conquistaRepository.create({ ...data, usuario: user, conquistada: true });
    return this.conquistaRepository.save(conquista);
  }
} 
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Favorito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  categoria: string;

  @Column({ default: false })
  online: boolean;

  @Column({ default: 0 })
  seguidores: number;

  @ManyToOne(() => User, { eager: true })
  usuario: User;
} 
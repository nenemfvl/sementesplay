import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Conquista {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  descricao: string;

  @Column({ nullable: true })
  icone: string;

  @Column({ default: false })
  conquistada: boolean;

  @ManyToOne(() => User, { eager: true })
  usuario: User;
} 
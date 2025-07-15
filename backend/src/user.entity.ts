import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Statistics } from './entities/statistics.entity';
import { Ranking } from './entities/ranking.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Statistics, statistics => statistics.user)
  statistics: Statistics[];

  @OneToMany(() => Ranking, ranking => ranking.user)
  rankings: Ranking[];
} 
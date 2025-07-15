import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class Ranking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.rankings)
  user: User;

  @Column()
  userId: number;

  @Column()
  category: string; // 'views', 'followers', 'engagement', 'streams'

  @Column()
  position: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  score: number;

  @Column({ default: 0 })
  previousPosition: number;

  @Column({ default: 0 })
  change: number; // positive = up, negative = down

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
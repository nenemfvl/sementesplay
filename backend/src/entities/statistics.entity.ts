import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class Statistics {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.statistics)
  user: User;

  @Column()
  userId: number;

  @Column({ default: 0 })
  totalViews: number;

  @Column({ default: 0 })
  totalLikes: number;

  @Column({ default: 0 })
  totalComments: number;

  @Column({ default: 0 })
  totalShares: number;

  @Column({ default: 0 })
  totalFollowers: number;

  @Column({ default: 0 })
  totalStreams: number;

  @Column({ default: 0 })
  totalHoursStreamed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageViewers: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  engagementRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
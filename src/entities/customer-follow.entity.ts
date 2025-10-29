import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { FollowType } from '../common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';

/**
 * 客户跟进记录实体
 */
@Entity({ name: 'customer_follows', comment: '客户跟进记录表' })
@Index(['customerId'])
@Index(['userId'])
@Index(['type'])
export class CustomerFollow extends BaseEntity {
  @ApiProperty({ description: '客户ID' })
  @Column({ name: 'customer_id' })
  customerId: number;

  @ApiProperty({ description: '跟进人ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '跟进类型', enum: FollowType })
  @Column({
    type: 'enum',
    enum: FollowType,
  })
  type: FollowType;

  @ApiProperty({ description: '跟进内容' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: '下次跟进时间' })
  @Column({ name: 'next_follow_at', type: 'datetime', nullable: true })
  nextFollowAt: Date;

  // 关联关系
  @ManyToOne(() => Customer, (customer) => customer.follows)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}


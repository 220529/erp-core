import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 操作日志实体
 */
@Entity({ name: 'logs', comment: '操作日志表' })
@Index(['userId'])
@Index(['module'])
@Index(['action'])
export class Log extends BaseEntity {
  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id', nullable: true, comment: '操作人ID' })
  userId: number;

  @ApiProperty({ description: '用户名' })
  @Column({ length: 50, nullable: true, comment: '操作人用户名' })
  username: string;

  @ApiProperty({ description: '模块' })
  @Column({ length: 50, comment: '操作模块(customer/order/payment等)' })
  module: string;

  @ApiProperty({ description: '操作类型' })
  @Column({ length: 20, comment: '操作类型(create/update/delete/view等)' })
  action: string;

  @ApiProperty({ description: '操作内容' })
  @Column({ type: 'text', nullable: true, comment: '操作详细内容' })
  content: string;

  @ApiProperty({ description: 'IP地址' })
  @Column({ length: 50, nullable: true, comment: '操作IP地址' })
  ip: string;

  @ApiProperty({ description: 'User-Agent' })
  @Column({ type: 'text', nullable: true, comment: '浏览器信息' })
  userAgent: string;

  @ApiProperty({ description: '请求方法' })
  @Column({ length: 10, nullable: true, comment: 'HTTP方法(GET/POST等)' })
  method: string;

  @ApiProperty({ description: '请求路径' })
  @Column({ type: 'text', nullable: true, comment: '请求URL路径' })
  path: string;

  @ApiProperty({ description: '耗时' })
  @Column({ nullable: true, comment: '请求耗时(毫秒)' })
  duration: number;
}


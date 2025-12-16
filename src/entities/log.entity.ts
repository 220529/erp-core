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
@Index(['targetId'])
@Index(['status'])
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
  @Column({ length: 100, comment: '操作类型/名称' })
  action: string;

  @ApiProperty({ description: '业务对象ID' })
  @Column({ name: 'target_id', nullable: true, comment: '业务对象ID(订单ID/客户ID等)' })
  targetId: number;

  @ApiProperty({ description: '操作内容' })
  @Column({ type: 'text', nullable: true, comment: '操作详细内容/描述' })
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

  @ApiProperty({ description: '请求参数' })
  @Column({ name: 'request_body', type: 'text', nullable: true, comment: '请求参数JSON' })
  requestBody: string;

  @ApiProperty({ description: '响应结果' })
  @Column({ name: 'response_body', type: 'text', nullable: true, comment: '响应结果JSON' })
  responseBody: string;

  @ApiProperty({ description: '操作状态' })
  @Column({ length: 20, nullable: true, default: 'success', comment: '操作状态: success/error' })
  status: string;

  @ApiProperty({ description: '错误信息' })
  @Column({ name: 'error_msg', type: 'text', nullable: true, comment: '错误信息' })
  errorMsg: string;

  @ApiProperty({ description: '耗时' })
  @Column({ nullable: true, comment: '请求耗时(毫秒)' })
  duration: number;
}


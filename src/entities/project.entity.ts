import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ProjectStatus } from '../common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Customer } from './customer.entity';

/**
 * 项目实体
 */
@Entity({ name: 'projects', comment: '施工项目表' })
@Index(['orderId'])
@Index(['status'])
export class Project extends BaseEntity {
  @ApiProperty({ description: '项目编号' })
  @Column({ name: 'project_no', length: 50, unique: true })
  projectNo: string;

  @ApiProperty({ description: '订单ID' })
  @Column({ name: 'order_id' })
  orderId: number;

  @ApiProperty({ description: '客户ID' })
  @Column({ name: 'customer_id' })
  customerId: number;

  @ApiProperty({ description: '项目名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '施工地址' })
  @Column({ type: 'text' })
  address: string;

  @ApiProperty({ description: '项目状态', enum: ProjectStatus })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
    comment: '项目状态: planning-计划中, in_progress-进行中, paused-已暂停, completed-已完工',
  })
  status: ProjectStatus;

  @ApiProperty({ description: '工长ID' })
  @Column({ name: 'foreman_id', nullable: true, comment: '负责工长ID' })
  foremanId: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  remark: string;

  // 关联关系
  @ManyToOne(() => Order, (order) => order.projects)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}


import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { OrderStatus } from '../common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { OrderMaterial } from './order-material.entity';
import { Payment } from './payment.entity';

/**
 * 订单实体
 */
@Entity({ name: 'orders', comment: '订单主表' })
@Index(['customerId'])
@Index(['status'])
export class Order extends BaseEntity {
  @ApiProperty({ description: '订单号' })
  @Column({ name: 'order_no', length: 50, unique: true, comment: '订单编号(唯一)' })
  orderNo: string;

  @ApiProperty({ description: '客户ID' })
  @Column({ name: 'customer_id', comment: '客户ID' })
  customerId: number;

  @ApiProperty({ description: '订单状态', enum: OrderStatus })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    comment: '订单状态: pending-待签约, signed-已签约, in_progress-施工中, completed-已完工, voided-已作废',
  })
  status: OrderStatus;

  @ApiProperty({ description: '订单总金额' })
  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '订单总金额(元)',
  })
  totalAmount: number;

  @ApiProperty({ description: '已收金额' })
  @Column({
    name: 'paid_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '已收金额(元)',
  })
  paidAmount: number;

  @ApiProperty({ description: '成本金额' })
  @Column({
    name: 'cost_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  costAmount: number;

  @ApiProperty({ description: '设计师ID' })
  @Column({ name: 'designer_id', nullable: true })
  designerId: number;

  @ApiProperty({ description: '工长ID' })
  @Column({ name: 'foreman_id', nullable: true })
  foremanId: number;

  @ApiProperty({ description: '签约时间' })
  @Column({ name: 'signed_at', type: 'datetime', nullable: true })
  signedAt: Date;

  @ApiProperty({ description: '开工时间' })
  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date;

  @ApiProperty({ description: '完工时间' })
  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  remark: string;

  // 关联关系
  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => OrderMaterial, (material) => material.order)
  materials: OrderMaterial[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}


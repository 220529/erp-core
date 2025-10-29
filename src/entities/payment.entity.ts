import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { PaymentType, PaymentStatus } from '../common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';

/**
 * 收款实体
 */
@Entity({ name: 'payments', comment: '收款记录表' })
@Index(['orderId'])
@Index(['status'])
export class Payment extends BaseEntity {
  @ApiProperty({ description: '收款单号' })
  @Column({ name: 'payment_no', length: 50, unique: true })
  paymentNo: string;

  @ApiProperty({ description: '订单ID' })
  @Column({ name: 'order_id' })
  orderId: number;

  @ApiProperty({ description: '收款类型', enum: PaymentType })
  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @ApiProperty({ description: '收款金额' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @ApiProperty({ description: '收款方式' })
  @Column({ length: 50, nullable: true })
  method: string;

  @ApiProperty({ description: '收款状态', enum: PaymentStatus })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({ description: '收款时间' })
  @Column({ name: 'paid_at', type: 'datetime', nullable: true, comment: '实际收款时间' })
  paidAt: Date;

  @ApiProperty({ description: '创建人ID' })
  @Column({ name: 'created_by', comment: '创建人ID' })
  createdBy: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  remark: string;

  // 关联关系
  @ManyToOne(() => Order, (order) => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}


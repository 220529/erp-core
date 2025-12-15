import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { CustomerStatus } from '../common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { CustomerFollow } from './customer-follow.entity';
import { Order } from './order.entity';
import { Exportable } from '../common/decorators/exportable.decorator';
import {
  customerStatusTransform,
  dateTimeTransform,
} from '../common/transforms';

/**
 * 客户实体
 */
@Entity({ name: 'customers', comment: '客户信息表' })
@Index(['mobile'])
@Index(['status'])
@Index(['salesId'])
export class Customer extends BaseEntity {
  @ApiProperty({ description: '客户姓名' })
  @Exportable({ header: '客户姓名', width: 15, order: 1 })
  @Column({ length: 50, comment: '客户姓名' })
  name: string;

  @ApiProperty({ description: '手机号' })
  @Exportable({ header: '手机号', width: 15, order: 2 })
  @Column({ length: 20, comment: '联系电话' })
  mobile: string;

  @ApiProperty({ description: '地址' })
  @Exportable({ header: '地址', width: 30, order: 4 })
  @Column({ type: 'text', nullable: true, comment: '详细地址' })
  address: string;

  @ApiProperty({ description: '区域' })
  @Exportable({ header: '区域', width: 15, order: 3 })
  @Column({ length: 100, nullable: true, comment: '所属区域' })
  area: string;

  @ApiProperty({ description: '客户状态', enum: CustomerStatus })
  @Exportable({
    header: '状态',
    width: 12,
    order: 5,
    transform: customerStatusTransform,
  })
  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.NEW,
    comment: '客户状态: new-新客户, measured-已量房, quoted-已报价, signed-已签约, completed-已完工',
  })
  status: CustomerStatus;

  @ApiProperty({ description: '销售ID' })
  @Column({ name: 'sales_id', nullable: true, comment: '负责销售ID' })
  salesId: number;

  @ApiProperty({ description: '设计师ID' })
  @Column({ name: 'designer_id', nullable: true, comment: '负责设计师ID' })
  designerId: number;

  @ApiProperty({ description: '备注' })
  @Exportable({ header: '备注', width: 25, order: 6 })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;

  @Exportable({
    header: '创建时间',
    width: 20,
    order: 7,
    transform: dateTimeTransform,
  })
  declare createdAt: Date;

  // 关联关系
  @OneToMany(() => CustomerFollow, (follow) => follow.customer)
  follows: CustomerFollow[];

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];
}


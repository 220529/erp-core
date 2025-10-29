import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { OrderItemCategory } from '../common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Material } from './material.entity';

/**
 * 订单物料明细实体
 */
@Entity({ name: 'order_materials', comment: '订单物料明细表' })
@Index(['orderId'])
@Index(['materialId'])
export class OrderMaterial extends BaseEntity {
  @ApiProperty({ description: '订单ID' })
  @Column({ name: 'order_id', comment: '订单ID' })
  orderId: number;

  @ApiProperty({ description: '材料ID' })
  @Column({ name: 'material_id', nullable: true, comment: '材料ID' })
  materialId: number;

  @ApiProperty({ description: '材料名称' })
  @Column({ name: 'material_name', length: 100, comment: '材料名称' })
  materialName: string;

  @ApiProperty({ description: '明细类别', enum: OrderItemCategory })
  @Column({
    type: 'enum',
    enum: OrderItemCategory,
    comment: '类别: main-主材, labor-人工, addition-增项',
  })
  category: OrderItemCategory;

  @ApiProperty({ description: '数量' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '数量',
  })
  quantity: number;

  @ApiProperty({ description: '单位' })
  @Column({ length: 20, comment: '单位(个/米/平方米等)' })
  unit: string;

  @ApiProperty({ description: '单价' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '单价(元)',
  })
  price: number;

  @ApiProperty({ description: '小计金额' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '小计金额(元) = 数量 × 单价',
  })
  amount: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;

  // 关联关系
  @ManyToOne(() => Order, (order) => order.materials)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Material, (material) => material.orderMaterials)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}


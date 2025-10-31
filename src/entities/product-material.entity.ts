import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';
import { Material } from './material.entity';

/**
 * 产品物料关联实体
 * 定义套餐包含哪些物料及数量
 */
@Entity({ name: 'product_materials', comment: '产品物料关联表' })
@Index(['productId'])
@Index(['materialId'])
export class ProductMaterial extends BaseEntity {
  @ApiProperty({ description: '产品ID' })
  @Column({ name: 'product_id', comment: '产品ID' })
  productId: number;

  @ApiProperty({ description: '物料ID' })
  @Column({ name: 'material_id', nullable: true, comment: '物料ID（可为空，支持自定义物料）' })
  materialId: number;

  @ApiProperty({ description: '物料名称' })
  @Column({ name: 'material_name', length: 100, comment: '物料名称' })
  materialName: string;

  @ApiProperty({ description: '物料类别' })
  @Column({ length: 50, comment: '物料类别：main-主材, labor-人工' })
  category: string;

  @ApiProperty({ description: '数量' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '数量',
  })
  quantity: number;

  @ApiProperty({ description: '单位' })
  @Column({ length: 20, comment: '单位' })
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
    comment: '小计金额(元)',
  })
  amount: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;

  // 关联关系
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}


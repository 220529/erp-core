import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ProductStatus } from '../common/constants';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 产品/套餐实体
 * 用于标准化的装修套餐模板
 */
@Entity({ name: 'products', comment: '产品套餐表' })
@Index(['status'])
export class Product extends BaseEntity {
  @ApiProperty({ description: '产品编码' })
  @Column({ length: 50, unique: true, comment: '产品编码(唯一)' })
  code: string;

  @ApiProperty({ description: '产品名称' })
  @Column({ length: 100, comment: '产品名称（如：现代简约三居室套餐）' })
  name: string;

  @ApiProperty({ description: '成本价' })
  @Column({
    name: 'cost_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '套餐成本价(元)',
  })
  costPrice: number;

  @ApiProperty({ description: '售价' })
  @Column({
    name: 'sale_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '套餐售价(元)',
  })
  salePrice: number;

  @ApiProperty({ description: '产品描述' })
  @Column({ type: 'text', nullable: true, comment: '产品描述' })
  description: string;

  @ApiProperty({ description: '产品状态', enum: ProductStatus })
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
    comment: '产品状态: active-启用, inactive-停用',
  })
  status: ProductStatus;

  @ApiProperty({ description: '排序' })
  @Column({ default: 0, comment: '排序值，越大越靠前' })
  sort: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;
}


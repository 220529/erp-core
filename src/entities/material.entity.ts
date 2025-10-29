import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { MaterialCategory, MaterialStatus } from '../common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { OrderMaterial } from './order-material.entity';

/**
 * 材料实体
 */
@Entity({ name: 'materials', comment: '物料库表' })
@Index(['category'])
@Index(['status'])
export class Material extends BaseEntity {
  @ApiProperty({ description: '材料编码' })
  @Column({ length: 50, unique: true })
  code: string;

  @ApiProperty({ description: '材料名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '材料类别', enum: MaterialCategory })
  @Column({
    type: 'enum',
    enum: MaterialCategory,
  })
  category: MaterialCategory;

  @ApiProperty({ description: '品牌' })
  @Column({ length: 100, nullable: true })
  brand: string;

  @ApiProperty({ description: '规格' })
  @Column({ length: 100, nullable: true })
  spec: string;

  @ApiProperty({ description: '单位' })
  @Column({ length: 20, default: '个' })
  unit: string;

  @ApiProperty({ description: '成本价' })
  @Column({
    name: 'cost_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  costPrice: number;

  @ApiProperty({ description: '销售价' })
  @Column({
    name: 'sale_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  salePrice: number;

  @ApiProperty({ description: '图片URL' })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @ApiProperty({ description: '状态', enum: MaterialStatus })
  @Column({
    type: 'enum',
    enum: MaterialStatus,
    default: MaterialStatus.ACTIVE,
  })
  status: MaterialStatus;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true })
  remark: string;

  // 关联关系
  @OneToMany(() => OrderMaterial, (material) => material.material)
  orderMaterials: OrderMaterial[];
}


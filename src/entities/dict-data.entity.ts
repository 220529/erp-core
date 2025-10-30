import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 字典数据实体
 */
@Entity({ name: 'dict_data', comment: '字典数据表' })
@Index(['typeCode'])
@Index(['status'])
export class DictData extends BaseEntity {
  @ApiProperty({ description: '字典类型编码' })
  @Column({ length: 50, comment: '关联字典类型编码', name: 'type_code' })
  typeCode: string;

  @ApiProperty({ description: '字典标签' })
  @Column({ length: 100, comment: '字典标签（显示名称）' })
  label: string;

  @ApiProperty({ description: '字典值' })
  @Column({ length: 200, comment: '字典值（实际值）' })
  value: string;

  @ApiProperty({ description: '排序' })
  @Column({ default: 0, comment: '排序序号' })
  sort: number;

  @ApiProperty({ description: '状态' })
  @Column({ default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @ApiProperty({ description: '样式类型' })
  @Column({ length: 50, nullable: true, comment: '样式类型（如标签颜色）' })
  cssClass: string;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;
}


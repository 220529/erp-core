import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 字典类型实体
 */
@Entity({ name: 'dict_types', comment: '字典类型表' })
@Index(['code'], { unique: true })
@Index(['status'])
export class DictType extends BaseEntity {
  @ApiProperty({ description: '字典类型编码' })
  @Column({ length: 50, comment: '字典类型编码 如: customer_source' })
  code: string;

  @ApiProperty({ description: '字典类型名称' })
  @Column({ length: 100, comment: '字典类型名称 如: 客户来源' })
  name: string;

  @ApiProperty({ description: '排序' })
  @Column({ default: 0, comment: '排序序号' })
  sort: number;

  @ApiProperty({ description: '状态' })
  @Column({ default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;
}


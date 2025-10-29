import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 字典实体
 */
@Entity({ name: 'dicts', comment: '字典表' })
@Index(['type'])
@Index(['status'])
export class Dict extends BaseEntity {
  @ApiProperty({ description: '字典类型' })
  @Column({ length: 50, comment: '字典类型(如: customer_source, order_type等)' })
  type: string;

  @ApiProperty({ description: '字典键' })
  @Column({ length: 50, comment: '字典键' })
  key: string;

  @ApiProperty({ description: '字典值' })
  @Column({ length: 200, comment: '字典值' })
  value: string;

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


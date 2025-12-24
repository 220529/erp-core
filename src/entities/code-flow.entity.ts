import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 代码流程实体
 * 存储动态业务逻辑代码
 */
@Entity({ name: 'code_flows', comment: '代码流程表' })
@Index(['category'])
@Index(['status'])
export class CodeFlow extends BaseEntity {
  @ApiProperty({ description: '流程唯一标识' })
  @Column({ length: 100, unique: true, comment: '流程唯一标识key' })
  key: string;

  @ApiProperty({ description: '流程名称' })
  @Column({ length: 200, comment: '流程名称' })
  name: string;

  @ApiProperty({ description: '流程分类' })
  @Column({ length: 50, nullable: true, comment: '流程分类(如: order, customer, payment等)' })
  category: string;

  @ApiProperty({ description: '流程描述' })
  @Column({ type: 'text', nullable: true, comment: '流程功能描述' })
  description: string;

  @ApiProperty({ description: '流程代码' })
  @Column({ name: 'code', type: 'text', comment: '流程代码内容(JavaScript)' })
  code: string;

  @ApiProperty({ description: '状态' })
  @Column({ default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @ApiProperty({ description: '创建人ID' })
  @Column({ name: 'created_by', nullable: true, comment: '创建人ID' })
  createdBy: number;

  @ApiProperty({ description: '更新人ID' })
  @Column({ name: 'updated_by', nullable: true, comment: '最后更新人ID' })
  updatedBy: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;

  @ApiProperty({ description: '最后发布时间' })
  @Column({ name: 'published_at', type: 'datetime', nullable: true, comment: '最后发布到生产环境的时间' })
  publishedAt: Date;
}


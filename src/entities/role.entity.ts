import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 角色实体
 */
@Entity({ name: 'roles', comment: '角色表' })
export class Role extends BaseEntity {
  @ApiProperty({ description: '角色标识' })
  @Column({ length: 50, unique: true, comment: '角色标识(admin/sales/designer/foreman/finance)' })
  key: string;

  @ApiProperty({ description: '角色名称' })
  @Column({ length: 50, comment: '角色名称' })
  name: string;

  @ApiProperty({ description: '角色描述' })
  @Column({ type: 'text', nullable: true, comment: '角色描述' })
  description: string;

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


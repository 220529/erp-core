import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from './company.entity';
import { User } from './user.entity';

/**
 * 部门实体
 */
@Entity({ name: 'departments', comment: '部门表' })
@Index(['companyId'])
export class Department extends BaseEntity {
  @ApiProperty({ description: '部门名称' })
  @Column({ length: 100, comment: '部门名称' })
  name: string;

  @ApiProperty({ description: '公司ID' })
  @Column({ name: 'company_id', comment: '所属公司ID' })
  companyId: number;

  @ApiProperty({ description: '上级部门ID' })
  @Column({ name: 'parent_id', nullable: true, comment: '上级部门ID' })
  parentId: number;

  @ApiProperty({ description: '负责人' })
  @Column({ length: 50, nullable: true, comment: '部门负责人' })
  leader: string;

  @ApiProperty({ description: '联系电话' })
  @Column({ length: 20, nullable: true, comment: '联系电话' })
  phone: string;

  @ApiProperty({ description: '排序' })
  @Column({ default: 0, comment: '排序序号' })
  sort: number;

  @ApiProperty({ description: '状态' })
  @Column({ default: 1, comment: '状态: 1-正常 0-停用' })
  status: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;

  // 关联关系
  @ManyToOne(() => Company, (company) => company.departments)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => User, (user) => user.department)
  users: User[];
}


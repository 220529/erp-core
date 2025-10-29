import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Company } from './company.entity';
import { Department } from './department.entity';

/**
 * 用户实体
 */
@Entity({ name: 'users', comment: '系统用户表' })
export class User extends BaseEntity {
  @ApiProperty({ description: '用户名' })
  @Column({ length: 50, unique: true, comment: '用户名(唯一)' })
  username: string;

  @ApiProperty({ description: '姓名' })
  @Column({ length: 50, comment: '姓名' })
  name: string;

  @ApiProperty({ description: '密码' })
  @Column({ comment: '密码(已加密)' })
  @Exclude() // 在序列化时排除
  password: string;

  @ApiProperty({ description: '手机号' })
  @Column({ length: 20, unique: true, comment: '手机号(唯一)' })
  mobile: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ length: 100, nullable: true, comment: '邮箱地址' })
  email: string;

  @ApiProperty({ description: '头像' })
  @Column({ type: 'text', nullable: true, comment: '头像URL' })
  avatar: string;

  @ApiProperty({ description: '角色' })
  @Column({
    length: 50,
    default: 'sales',
    comment: '角色标识',
  })
  role: string;

  @ApiProperty({ description: '用户状态' })
  @Column({ default: 1, comment: '用户状态: 1-正常 0-禁用 2-锁定' })
  status: number;

  @ApiProperty({ description: '公司ID' })
  @Column({ name: 'company_id', nullable: true, comment: '公司ID' })
  companyId: number;

  @ApiProperty({ description: '部门ID' })
  @Column({ name: 'department_id', nullable: true, comment: '部门ID' })
  departmentId: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;

  // 关联关系
  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department, (department) => department.users)
  @JoinColumn({ name: 'department_id' })
  department: Department;
}


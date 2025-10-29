import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Department } from './department.entity';
import { User } from './user.entity';

/**
 * 公司实体
 */
@Entity({ name: 'companies', comment: '公司表' })
export class Company extends BaseEntity {
  @ApiProperty({ description: '公司名称' })
  @Column({ length: 100, comment: '公司名称' })
  name: string;

  @ApiProperty({ description: '联系人' })
  @Column({ length: 50, nullable: true, comment: '联系人' })
  contact: string;

  @ApiProperty({ description: '联系电话' })
  @Column({ length: 20, nullable: true, comment: '联系电话' })
  phone: string;

  @ApiProperty({ description: '地址' })
  @Column({ length: 200, nullable: true, comment: '公司地址' })
  address: string;

  @ApiProperty({ description: '状态' })
  @Column({ default: 1, comment: '状态: 1-正常 0-停用' })
  status: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;

  // 关联关系
  @OneToMany(() => Department, (department) => department.company)
  departments: Department[];

  @OneToMany(() => User, (user) => user.company)
  users: User[];
}


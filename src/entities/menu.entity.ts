import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { RoleMenu } from './role-menu.entity';

/**
 * 菜单实体
 */
@Entity({ name: 'menus', comment: '菜单表' })
@Index(['parentId'])
@Index(['sort'])
export class Menu extends BaseEntity {
  @ApiProperty({ description: '菜单名称' })
  @Column({ length: 50, comment: '菜单名称' })
  name: string;

  @ApiProperty({ description: '菜单标题' })
  @Column({ length: 50, comment: '菜单标题(显示用)' })
  title: string;

  @ApiProperty({ description: '菜单图标' })
  @Column({ length: 50, nullable: true, comment: '菜单图标' })
  icon: string;

  @ApiProperty({ description: '路由路径' })
  @Column({ length: 200, nullable: true, comment: '前端路由路径' })
  path: string;

  @ApiProperty({ description: '组件路径' })
  @Column({ length: 200, nullable: true, comment: '前端组件路径' })
  component: string;

  @ApiProperty({ description: '上级菜单ID' })
  @Column({ name: 'parent_id', nullable: true, comment: '上级菜单ID(支持树形结构)' })
  parentId: number;

  @ApiProperty({ description: '菜单类型' })
  @Column({ length: 20, default: 'menu', comment: '类型: menu-菜单, button-按钮' })
  type: string;

  @ApiProperty({ description: '权限标识' })
  @Column({ length: 100, nullable: true, comment: '权限标识(如: customer:create)' })
  permission: string;

  @ApiProperty({ description: '排序' })
  @Column({ default: 0, comment: '排序序号' })
  sort: number;

  @ApiProperty({ description: '是否隐藏' })
  @Column({ default: 0, comment: '是否隐藏: 1-隐藏 0-显示' })
  hidden: number;

  @ApiProperty({ description: '状态' })
  @Column({ default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark: string;

  // 关联关系
  @OneToMany(() => RoleMenu, (roleMenu) => roleMenu.menu)
  roleMenus: RoleMenu[];
}


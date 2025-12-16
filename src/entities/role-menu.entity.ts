import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Menu } from './menu.entity';

/**
 * 角色菜单关联实体
 */
@Entity({ name: 'role_menus', comment: '角色菜单关联表' })
@Index(['role'])
@Index(['menuId'])
export class RoleMenu extends BaseEntity {
  @ApiProperty({ description: '角色标识' })
  @Column({ length: 50, comment: '角色标识(admin/designer/foreman/finance)' })
  role: string;

  @ApiProperty({ description: '菜单ID' })
  @Column({ name: 'menu_id', comment: '菜单ID' })
  menuId: number;

  // 关联关系
  @ManyToOne(() => Menu, (menu) => menu.roleMenus)
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;
}


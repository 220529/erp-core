import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Menu, RoleMenu } from '../../entities';

/**
 * 菜单树节点
 */
export interface MenuTreeNode extends Menu {
  children?: MenuTreeNode[];
}

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepository: Repository<RoleMenu>,
  ) {}

  /**
   * 获取用户的权限标识列表
   */
  async getUserPermissions(role: string): Promise<string[]> {
    // admin 拥有所有权限
    if (role === 'admin') {
      return ['*'];
    }

    // 查询角色关联的菜单
    const roleMenus = await this.roleMenuRepository.find({
      where: { role },
    });

    if (roleMenus.length === 0) {
      return [];
    }

    const menuIds = roleMenus.map((rm) => rm.menuId);

    // 查询菜单的权限标识
    const menus = await this.menuRepository.find({
      where: {
        id: In(menuIds),
        status: 1,
      },
      select: ['permission'],
    });

    // 过滤出有权限标识的菜单
    return menus
      .map((m) => m.permission)
      .filter((p): p is string => p !== null && p !== undefined && p !== '');
  }

  /**
   * 获取用户的菜单树
   */
  async getUserMenus(role: string): Promise<MenuTreeNode[]> {
    let menus: Menu[];

    if (role === 'admin') {
      // admin 返回所有启用的菜单
      menus = await this.menuRepository.find({
        where: { status: 1 },
        order: { sort: 'ASC' },
      });
    } else {
      // 查询角色关联的菜单
      const roleMenus = await this.roleMenuRepository.find({
        where: { role },
      });

      if (roleMenus.length === 0) {
        return [];
      }

      const menuIds = roleMenus.map((rm) => rm.menuId);

      menus = await this.menuRepository.find({
        where: {
          id: In(menuIds),
          status: 1,
        },
        order: { sort: 'ASC' },
      });
    }

    // 构建菜单树
    return this.buildMenuTree(menus);
  }

  /**
   * 获取所有菜单（用于菜单管理）
   */
  async getAllMenus(): Promise<Menu[]> {
    return this.menuRepository.find({
      order: { sort: 'ASC' },
    });
  }

  /**
   * 获取所有菜单树
   */
  async getAllMenuTree(): Promise<MenuTreeNode[]> {
    const menus = await this.menuRepository.find({
      where: { status: 1 },
      order: { sort: 'ASC' },
    });
    return this.buildMenuTree(menus);
  }

  /**
   * 检查用户是否有某个权限
   */
  async hasPermission(role: string, permission: string): Promise<boolean> {
    if (role === 'admin') {
      return true;
    }

    const permissions = await this.getUserPermissions(role);
    return permissions.includes(permission);
  }

  /**
   * 构建菜单树
   */
  private buildMenuTree(menus: Menu[]): MenuTreeNode[] {
    const menuMap = new Map<number, MenuTreeNode>();
    const tree: MenuTreeNode[] = [];

    // 先将所有菜单放入 map
    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // 构建树形结构
    menus.forEach((menu) => {
      const node = menuMap.get(menu.id)!;
      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    });

    // 移除空的 children 数组
    const cleanTree = (nodes: MenuTreeNode[]): MenuTreeNode[] => {
      return nodes.map((node) => {
        if (node.children && node.children.length === 0) {
          const { children, ...rest } = node;
          return rest as MenuTreeNode;
        }
        if (node.children) {
          node.children = cleanTree(node.children);
        }
        return node;
      });
    };

    return cleanTree(tree);
  }
}

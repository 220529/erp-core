import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Role, RoleMenu, Menu } from '../../entities';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepository: Repository<RoleMenu>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  /**
   * 角色列表
   */
  async findAll(query: { page?: number; pageSize?: number; status?: number }) {
    const { page = 1, pageSize = 10, status } = query;

    const where: any = {};
    if (status !== undefined) where.status = status;

    const [list, total] = await this.roleRepository.findAndCount({
      where,
      order: { sort: 'ASC', id: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total, page, pageSize };
  }

  /**
   * 所有角色（下拉选择用）
   */
  async findAllSimple() {
    return this.roleRepository.find({
      where: { status: 1 },
      select: ['id', 'key', 'name'],
      order: { sort: 'ASC' },
    });
  }

  /**
   * 角色详情
   */
  async findOne(id: number) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new BadRequestException('角色不存在');
    }
    return role;
  }

  /**
   * 创建角色
   */
  async create(data: Partial<Role>) {
    // 检查 key 唯一性
    const existsKey = await this.roleRepository.findOne({
      where: { key: data.key },
    });
    if (existsKey) {
      throw new BadRequestException('角色标识已存在');
    }
    const role = this.roleRepository.create(data);
    return this.roleRepository.save(role);
  }

  /**
   * 更新角色
   */
  async update(id: number, data: Partial<Role>) {
    const role = await this.findOne(id);

    // admin 角色不能修改 key
    if (role.key === 'admin' && data.key && data.key !== 'admin') {
      throw new BadRequestException('不能修改管理员角色标识');
    }

    // 检查 key 唯一性
    if (data.key && data.key !== role.key) {
      const exists = await this.roleRepository.findOne({
        where: { key: data.key, id: Not(id) },
      });
      if (exists) {
        throw new BadRequestException('角色标识已存在');
      }
    }

    Object.assign(role, data);
    return this.roleRepository.save(role);
  }

  /**
   * 删除角色
   */
  async remove(id: number) {
    const role = await this.findOne(id);
    if (role.key === 'admin') {
      throw new BadRequestException('不能删除管理员角色');
    }
    // 删除角色菜单关联
    await this.roleMenuRepository.delete({ role: role.key });
    return this.roleRepository.remove(role);
  }

  /**
   * 获取角色的菜单ID列表
   */
  async getRoleMenus(roleKey: string): Promise<number[]> {
    const roleMenus = await this.roleMenuRepository.find({
      where: { role: roleKey },
    });
    return roleMenus.map((rm) => rm.menuId);
  }

  /**
   * 分配角色权限
   */
  async assignMenus(roleKey: string, menuIds: number[]) {
    // admin 角色不需要分配权限
    if (roleKey === 'admin') {
      throw new BadRequestException('管理员角色拥有所有权限，无需分配');
    }

    // 删除原有权限
    await this.roleMenuRepository.delete({ role: roleKey });

    // 添加新权限
    if (menuIds.length > 0) {
      const roleMenus = menuIds.map((menuId) => ({
        role: roleKey,
        menuId,
      }));
      await this.roleMenuRepository.save(roleMenus);
    }

    return { success: true };
  }

  /**
   * 获取所有菜单树（用于权限分配）
   */
  async getMenuTree() {
    const menus = await this.menuRepository.find({
      where: { status: 1 },
      order: { sort: 'ASC', id: 'ASC' },
    });
    return this.buildMenuTree(menus);
  }

  /**
   * 构建菜单树
   */
  private buildMenuTree(menus: Menu[]): any[] {
    const map = new Map<number, any>();
    const tree: any[] = [];

    menus.forEach((menu) => {
      map.set(menu.id, { ...menu, children: [] });
    });

    menus.forEach((menu) => {
      const node = map.get(menu.id)!;
      if (menu.parentId && map.has(menu.parentId)) {
        const parent = map.get(menu.parentId)!;
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    });

    // 清理空 children
    const clean = (nodes: any[]): any[] => {
      return nodes.map((n) => {
        if (n.children && n.children.length === 0) {
          const { children, ...rest } = n;
          return rest;
        }
        if (n.children) n.children = clean(n.children);
        return n;
      });
    };

    return clean(tree);
  }
}

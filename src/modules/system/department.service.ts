import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../entities';

export interface DepartmentTreeNode extends Department {
  children?: DepartmentTreeNode[];
}

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  /**
   * 部门列表（按公司）
   */
  async findAll(companyId?: number) {
    const where: any = {};
    if (companyId) where.companyId = companyId;

    return this.departmentRepository.find({
      where,
      order: { sort: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 部门树（按公司）
   */
  async findTree(companyId: number): Promise<DepartmentTreeNode[]> {
    const departments = await this.departmentRepository.find({
      where: { companyId, status: 1 },
      order: { sort: 'ASC', id: 'ASC' },
    });
    return this.buildTree(departments);
  }

  /**
   * 部门详情
   */
  async findOne(id: number) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new BadRequestException('部门不存在');
    }
    return department;
  }

  /**
   * 创建部门
   */
  async create(data: Partial<Department>) {
    // 检查同公司下是否有同名部门
    const exists = await this.departmentRepository.findOne({
      where: { companyId: data.companyId, name: data.name },
    });
    if (exists) {
      throw new BadRequestException('该公司下已存在同名部门');
    }
    const department = this.departmentRepository.create(data);
    return this.departmentRepository.save(department);
  }

  /**
   * 更新部门
   */
  async update(id: number, data: Partial<Department>) {
    const department = await this.findOne(id);
    if (data.name && data.name !== department.name) {
      const exists = await this.departmentRepository.findOne({
        where: { companyId: department.companyId, name: data.name },
      });
      if (exists) {
        throw new BadRequestException('该公司下已存在同名部门');
      }
    }
    // 不能将自己设为上级
    if (data.parentId === id) {
      throw new BadRequestException('不能将自己设为上级部门');
    }
    Object.assign(department, data);
    return this.departmentRepository.save(department);
  }

  /**
   * 删除部门
   */
  async remove(id: number) {
    const department = await this.findOne(id);
    // 检查是否有子部门
    const children = await this.departmentRepository.findOne({
      where: { parentId: id },
    });
    if (children) {
      throw new BadRequestException('该部门下有子部门，无法删除');
    }
    return this.departmentRepository.remove(department);
  }

  /**
   * 构建部门树
   */
  private buildTree(departments: Department[]): DepartmentTreeNode[] {
    const map = new Map<number, DepartmentTreeNode>();
    const tree: DepartmentTreeNode[] = [];

    departments.forEach((dept) => {
      map.set(dept.id, { ...dept, children: [] });
    });

    departments.forEach((dept) => {
      const node = map.get(dept.id)!;
      if (dept.parentId && map.has(dept.parentId)) {
        const parent = map.get(dept.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    });

    // 清理空 children
    const clean = (nodes: DepartmentTreeNode[]): DepartmentTreeNode[] => {
      return nodes.map((n) => {
        if (n.children && n.children.length === 0) {
          const { children, ...rest } = n;
          return rest as DepartmentTreeNode;
        }
        if (n.children) n.children = clean(n.children);
        return n;
      });
    };

    return clean(tree);
  }
}

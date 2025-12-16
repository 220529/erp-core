import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Company, Department, User } from '../../entities';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 公司列表（分页）
   */
  async findAll(query: {
    page?: number;
    pageSize?: number;
    name?: string;
    status?: number;
  }) {
    const { page = 1, pageSize = 10, name, status } = query;

    const where: any = {};
    if (name) where.name = Like(`%${name}%`);
    if (status !== undefined) where.status = status;

    const [list, total] = await this.companyRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total, page, pageSize };
  }

  /**
   * 所有公司（下拉选择用）
   */
  async findAllSimple() {
    return this.companyRepository.find({
      where: { status: 1 },
      select: ['id', 'name'],
      order: { id: 'ASC' },
    });
  }

  /**
   * 公司详情
   */
  async findOne(id: number) {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new BadRequestException('公司不存在');
    }
    return company;
  }

  /**
   * 创建公司
   */
  async create(data: Partial<Company>) {
    const exists = await this.companyRepository.findOne({
      where: { name: data.name },
    });
    if (exists) {
      throw new BadRequestException('公司名称已存在');
    }
    const company = this.companyRepository.create(data);
    return this.companyRepository.save(company);
  }

  /**
   * 更新公司
   */
  async update(id: number, data: Partial<Company>) {
    const company = await this.findOne(id);
    if (data.name && data.name !== company.name) {
      const exists = await this.companyRepository.findOne({
        where: { name: data.name },
      });
      if (exists) {
        throw new BadRequestException('公司名称已存在');
      }
    }
    Object.assign(company, data);
    return this.companyRepository.save(company);
  }

  /**
   * 删除公司
   */
  async remove(id: number) {
    const company = await this.findOne(id);

    // 检查是否有用户
    const userCount = await this.userRepository.count({
      where: { companyId: id },
    });
    if (userCount > 0) {
      throw new BadRequestException(`该公司下有 ${userCount} 个用户，请先删除或转移用户`);
    }

    // 先删除该公司下的所有部门
    await this.departmentRepository.delete({ companyId: id });

    // 再删除公司
    return this.companyRepository.remove(company);
  }
}

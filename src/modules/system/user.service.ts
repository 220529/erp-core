import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';
import { User } from '../../entities';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 用户列表（分页）
   */
  async findAll(query: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    companyId?: number;
    departmentId?: number;
    role?: string;
    status?: number;
  }) {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      companyId,
      departmentId,
      role,
      status,
    } = query;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .leftJoinAndSelect('user.department', 'department');

    if (keyword) {
      qb.andWhere(
        '(user.username LIKE :keyword OR user.name LIKE :keyword OR user.mobile LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }
    if (companyId) qb.andWhere('user.companyId = :companyId', { companyId });
    if (departmentId)
      qb.andWhere('user.departmentId = :departmentId', { departmentId });
    if (role) qb.andWhere('user.role = :role', { role });
    if (status !== undefined) qb.andWhere('user.status = :status', { status });

    qb.orderBy('user.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await qb.getManyAndCount();

    // 移除密码字段
    const safeList = list.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });

    return { list: safeList, total, page, pageSize };
  }

  /**
   * 用户详情
   */
  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company', 'department'],
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    const { password, ...rest } = user;
    return rest;
  }

  /**
   * 创建用户
   */
  async create(data: {
    username: string;
    name: string;
    password: string;
    mobile: string;
    email?: string;
    role: string;
    companyId?: number;
    departmentId?: number;
    remark?: string;
  }) {
    // 检查用户名
    const existsUsername = await this.userRepository.findOne({
      where: { username: data.username },
    });
    if (existsUsername) {
      throw new BadRequestException('用户名已存在');
    }

    // 检查手机号
    const existsMobile = await this.userRepository.findOne({
      where: { mobile: data.mobile },
    });
    if (existsMobile) {
      throw new BadRequestException('手机号已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
      status: 1,
    });

    const saved = await this.userRepository.save(user);
    const { password, ...rest } = saved;
    return rest;
  }

  /**
   * 更新用户
   */
  async update(
    id: number,
    data: {
      name?: string;
      mobile?: string;
      email?: string;
      role?: string;
      companyId?: number;
      departmentId?: number;
      remark?: string;
    },
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 检查手机号唯一性
    if (data.mobile && data.mobile !== user.mobile) {
      const exists = await this.userRepository.findOne({
        where: { mobile: data.mobile, id: Not(id) },
      });
      if (exists) {
        throw new BadRequestException('手机号已存在');
      }
    }

    Object.assign(user, data);
    const saved = await this.userRepository.save(user);
    const { password, ...rest } = saved;
    return rest;
  }

  /**
   * 删除用户
   */
  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    // 不能删除 admin
    if (user.role === 'admin' && user.username === 'admin') {
      throw new BadRequestException('不能删除超级管理员');
    }
    return this.userRepository.remove(user);
  }

  /**
   * 修改用户状态
   */
  async updateStatus(id: number, status: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    if (user.role === 'admin' && user.username === 'admin') {
      throw new BadRequestException('不能禁用超级管理员');
    }
    user.status = status;
    await this.userRepository.save(user);
    return { success: true };
  }

  /**
   * 重置密码
   */
  async resetPassword(id: number, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    return { success: true };
  }
}

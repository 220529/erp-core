import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Role, User, Dict } from '../entities';

/**
 * 数据库种子数据服务
 * 在应用启动时自动初始化基础数据
 */
@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Dict)
    private readonly dictRepository: Repository<Dict>,
  ) {}

  async onModuleInit() {
    this.logger.log('开始检查并初始化基础数据...');
    await this.seedRoles();
    await this.seedDefaultAdmin();
    await this.seedDicts();
    this.logger.log('基础数据初始化完成！');
  }

  /**
   * 初始化角色数据
   */
  private async seedRoles() {
    const count = await this.roleRepository.count();
    if (count > 0) {
      this.logger.log('角色数据已存在，跳过初始化');
      return;
    }

    const roles = [
      {
        key: 'admin',
        name: '系统管理员',
        description: '拥有系统所有权限，可管理用户、角色、菜单等',
        sort: 1,
        status: 1,
      },
      {
        key: 'sales',
        name: '销售',
        description: '负责客户开发、订单管理、收款跟进',
        sort: 2,
        status: 1,
      },
      {
        key: 'designer',
        name: '设计师',
        description: '负责设计方案、效果图制作',
        sort: 3,
        status: 1,
      },
      {
        key: 'foreman',
        name: '工长',
        description: '负责施工现场管理、进度控制',
        sort: 4,
        status: 1,
      },
      {
        key: 'finance',
        name: '财务',
        description: '负责财务管理、收款确认、成本核算',
        sort: 5,
        status: 1,
      },
    ];

    await this.roleRepository.save(roles);
    this.logger.log(`✅ 已初始化 ${roles.length} 个角色`);
  }

  /**
   * 初始化默认管理员
   */
  private async seedDefaultAdmin() {
    const count = await this.userRepository.count();
    if (count > 0) {
      this.logger.log('用户数据已存在，跳过默认管理员创建');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = this.userRepository.create({
      username: 'admin',
      name: '系统管理员',
      password: hashedPassword,
      mobile: '13800138000',
      email: 'admin@example.com',
      role: 'admin',
      status: 1,
      remark: '系统默认管理员，首次登录请修改密码',
    });

    await this.userRepository.save(admin);
    this.logger.log('✅ 已创建默认管理员（admin/admin123）');
  }

  /**
   * 初始化字典数据
   */
  private async seedDicts() {
    const count = await this.dictRepository.count();
    if (count > 0) {
      this.logger.log('字典数据已存在，跳过初始化');
      return;
    }

    const dicts = [
      // 客户来源
      {
        type: 'customer_source',
        key: 'online',
        value: '线上推广',
        sort: 1,
        status: 1,
      },
      {
        type: 'customer_source',
        key: 'offline',
        value: '线下活动',
        sort: 2,
        status: 1,
      },
      {
        type: 'customer_source',
        key: 'referral',
        value: '客户转介绍',
        sort: 3,
        status: 1,
      },
      {
        type: 'customer_source',
        key: 'other',
        value: '其他渠道',
        sort: 4,
        status: 1,
      },

      // 收款方式
      {
        type: 'payment_method',
        key: 'cash',
        value: '现金',
        sort: 1,
        status: 1,
      },
      {
        type: 'payment_method',
        key: 'bank_transfer',
        value: '银行转账',
        sort: 2,
        status: 1,
      },
      {
        type: 'payment_method',
        key: 'alipay',
        value: '支付宝',
        sort: 3,
        status: 1,
      },
      {
        type: 'payment_method',
        key: 'wechat',
        value: '微信支付',
        sort: 4,
        status: 1,
      },

      // 材料单位
      {
        type: 'material_unit',
        key: 'piece',
        value: '个',
        sort: 1,
        status: 1,
      },
      {
        type: 'material_unit',
        key: 'meter',
        value: '米',
        sort: 2,
        status: 1,
      },
      {
        type: 'material_unit',
        key: 'square_meter',
        value: '平方米',
        sort: 3,
        status: 1,
      },
      {
        type: 'material_unit',
        key: 'box',
        value: '盒',
        sort: 4,
        status: 1,
      },
      {
        type: 'material_unit',
        key: 'set',
        value: '套',
        sort: 5,
        status: 1,
      },
    ];

    await this.dictRepository.save(dicts);
    this.logger.log(`✅ 已初始化 ${dicts.length} 条字典数据`);
  }
}


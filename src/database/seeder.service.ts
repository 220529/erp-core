import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Role, User, DictType, DictData } from '../entities';

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
    @InjectRepository(DictType)
    private readonly dictTypeRepository: Repository<DictType>,
    @InjectRepository(DictData)
    private readonly dictDataRepository: Repository<DictData>,
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
        key: 'designer',
        name: '设计师',
        description: '客户管理、订单管理、产品管理',
        sort: 2,
        status: 1,
      },
      {
        key: 'foreman',
        name: '工长',
        description: '查看订单、施工管理',
        sort: 3,
        status: 1,
      },
      {
        key: 'finance',
        name: '财务',
        description: '收款管理、查看订单',
        sort: 4,
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
    const count = await this.dictTypeRepository.count();
    if (count > 0) {
      this.logger.log('字典数据已存在，跳过初始化');
      return;
    }

    // 1. 创建字典类型
    const dictTypes = [
      { code: 'customer_source', name: '客户来源', sort: 1, status: 1, remark: '客户来源渠道' },
      { code: 'payment_method', name: '收款方式', sort: 2, status: 1, remark: '收款支付方式' },
      { code: 'material_unit', name: '物料单位', sort: 3, status: 1, remark: '物料计量单位' },
    ];
    await this.dictTypeRepository.save(dictTypes);

    // 2. 创建字典数据（使用 typeCode 关联）
    const dictDataList = [
      // 客户来源
      { typeCode: 'customer_source', label: '线上推广', value: 'online', sort: 1, status: 1 },
      { typeCode: 'customer_source', label: '线下活动', value: 'offline', sort: 2, status: 1 },
      { typeCode: 'customer_source', label: '客户转介绍', value: 'referral', sort: 3, status: 1 },
      { typeCode: 'customer_source', label: '其他渠道', value: 'other', sort: 4, status: 1 },

      // 收款方式
      { typeCode: 'payment_method', label: '现金', value: 'cash', sort: 1, status: 1 },
      { typeCode: 'payment_method', label: '银行转账', value: 'bank_transfer', sort: 2, status: 1 },
      { typeCode: 'payment_method', label: '支付宝', value: 'alipay', sort: 3, status: 1 },
      { typeCode: 'payment_method', label: '微信支付', value: 'wechat', sort: 4, status: 1 },

      // 物料单位
      { typeCode: 'material_unit', label: '个', value: 'piece', sort: 1, status: 1 },
      { typeCode: 'material_unit', label: '米', value: 'meter', sort: 2, status: 1 },
      { typeCode: 'material_unit', label: '平方米', value: 'square_meter', sort: 3, status: 1 },
      { typeCode: 'material_unit', label: '盒', value: 'box', sort: 4, status: 1 },
      { typeCode: 'material_unit', label: '套', value: 'set', sort: 5, status: 1 },
    ];
    await this.dictDataRepository.save(dictDataList);

    this.logger.log(`✅ 已初始化 ${dictTypes.length} 个字典类型和 ${dictDataList.length} 条字典数据`);
  }
}


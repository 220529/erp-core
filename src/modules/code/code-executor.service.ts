import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as vm from 'vm';
import {
  User,
  Company,
  Department,
  Role,
  Customer,
  CustomerFollow,
  Material,
  Order,
  OrderMaterial,
  Payment,
  Project,
  File,
  Dict,
  Menu,
  RoleMenu,
  Log,
  CodeFlow,
} from '../../entities';

/**
 * 代码执行器上下文
 */
interface CodeContext {
  // 数据访问层
  repositories: {
    userRepository: Repository<User>;
    companyRepository: Repository<Company>;
    departmentRepository: Repository<Department>;
    roleRepository: Repository<Role>;
    customerRepository: Repository<Customer>;
    customerFollowRepository: Repository<CustomerFollow>;
    materialRepository: Repository<Material>;
    orderRepository: Repository<Order>;
    orderMaterialRepository: Repository<OrderMaterial>;
    paymentRepository: Repository<Payment>;
    projectRepository: Repository<Project>;
    fileRepository: Repository<File>;
    dictRepository: Repository<Dict>;
    menuRepository: Repository<Menu>;
    roleMenuRepository: Repository<RoleMenu>;
    logRepository: Repository<Log>;
  };
  // 数据源（用于事务）
  dataSource: DataSource;
  // 输入参数
  params: any;
  // 当前用户
  user?: any;
}

/**
 * 代码执行器服务
 * 负责动态加载和执行数据库中的业务代码流程
 */
@Injectable()
export class CodeExecutorService {
  private readonly logger = new Logger(CodeExecutorService.name);
  private flowCache: Map<string, { code: string; timestamp: number }> =
    new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerFollow)
    private readonly customerFollowRepository: Repository<CustomerFollow>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderMaterial)
    private readonly orderMaterialRepository: Repository<OrderMaterial>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(Dict)
    private readonly dictRepository: Repository<Dict>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepository: Repository<RoleMenu>,
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    @InjectRepository(CodeFlow)
    private readonly codeFlowRepository: Repository<CodeFlow>,
  ) {}

  /**
   * 执行代码流程
   * @param flowCode 流程编码
   * @param params 输入参数
   * @param user 当前用户
   */
  async executeFlow(flowCode: string, params: any, user?: any): Promise<any> {
    this.logger.log(`执行代码流程: ${flowCode}`);

    // 从数据库获取代码流程
    const flow = await this.codeFlowRepository.findOne({
      where: { code: flowCode, status: 1 }, // 只执行启用状态的流程
    });

    if (!flow) {
      throw new NotFoundException(`代码流程 ${flowCode} 不存在或已禁用`);
    }

    // 获取流程代码（支持缓存）
    const flowFunction = await this.compileFlowCode(
      flow.code,
      flow.codeContent,
      flow.updatedAt,
    );

    // 构建执行上下文
    const context: CodeContext = {
      repositories: {
        userRepository: this.userRepository,
        companyRepository: this.companyRepository,
        departmentRepository: this.departmentRepository,
        roleRepository: this.roleRepository,
        customerRepository: this.customerRepository,
        customerFollowRepository: this.customerFollowRepository,
        materialRepository: this.materialRepository,
        orderRepository: this.orderRepository,
        orderMaterialRepository: this.orderMaterialRepository,
        paymentRepository: this.paymentRepository,
        projectRepository: this.projectRepository,
        fileRepository: this.fileRepository,
        dictRepository: this.dictRepository,
        menuRepository: this.menuRepository,
        roleMenuRepository: this.roleMenuRepository,
        logRepository: this.logRepository,
      },
      dataSource: this.dataSource,
      params,
      user,
    };

    // 执行代码流程
    try {
      const result = await flowFunction(context);
      this.logger.log(`代码流程执行成功: ${flowCode}`);
      return result;
    } catch (error) {
      this.logger.error(`代码流程执行失败: ${flowCode}`, error);
      throw error;
    }
  }

  /**
   * 编译代码流程
   * 使用 VM 模块安全地执行数据库中的代码
   */
  private async compileFlowCode(
    flowCode: string,
    codeContent: string,
    updatedAt: Date,
  ): Promise<Function> {
    // 检查缓存
    const cached = this.flowCache.get(flowCode);
    if (cached && cached.timestamp >= updatedAt.getTime()) {
      // 使用缓存的代码
      return this.createFunctionFromCode(cached.code);
    }

    // 缓存新代码
    this.flowCache.set(flowCode, {
      code: codeContent,
      timestamp: updatedAt.getTime(),
    });

    return this.createFunctionFromCode(codeContent);
  }

  /**
   * 从代码字符串创建可执行函数
   */
  private createFunctionFromCode(codeContent: string): Function {
    try {
      // 使用 VM 模块创建沙箱环境执行代码
      const script = new vm.Script(
        `(async function(context) { ${codeContent} })`,
      );

      const sandbox = {
        console,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
        Promise,
        // 可以添加其他安全的全局对象
      };

      const context = vm.createContext(sandbox);
      const flowFunction = script.runInContext(context, {
        timeout: 30000, // 30秒超时
      });

      if (typeof flowFunction !== 'function') {
        throw new Error('代码流程必须是一个异步函数');
      }

      return flowFunction;
    } catch (error) {
      this.logger.error('编译代码流程失败', error);
      throw new Error(`编译代码流程失败: ${error.message}`);
    }
  }

  /**
   * 列出所有可用的代码流程
   */
  async listFlows(): Promise<any[]> {
    const flows = await this.codeFlowRepository.find({
      where: { status: 1 },
      select: [
        'id',
        'code',
        'name',
        'category',
        'description',
        'status',
        'createdAt',
        'updatedAt',
      ],
      order: {
        category: 'ASC',
        code: 'ASC',
      },
    });

    return flows;
  }

  /**
   * 创建代码流程
   */
  async createFlow(data: Partial<CodeFlow>): Promise<CodeFlow> {
    const flow = this.codeFlowRepository.create(data);
    return await this.codeFlowRepository.save(flow);
  }

  /**
   * 更新代码流程
   */
  async updateFlow(
    code: string,
    data: Partial<CodeFlow>,
  ): Promise<CodeFlow> {
    const flow = await this.codeFlowRepository.findOne({
      where: { code },
    });

    if (!flow) {
      throw new NotFoundException(`代码流程 ${code} 不存在`);
    }

    Object.assign(flow, data);
    return await this.codeFlowRepository.save(flow);
  }

  /**
   * 删除/禁用代码流程
   */
  async deleteFlow(code: string): Promise<void> {
    const flow = await this.codeFlowRepository.findOne({
      where: { code },
    });

    if (!flow) {
      throw new NotFoundException(`代码流程 ${code} 不存在`);
    }

    // 软删除：将状态设置为禁用
    flow.status = 0;
    await this.codeFlowRepository.save(flow);

    // 清除缓存
    this.flowCache.delete(code);
  }

  /**
   * 清除流程缓存
   */
  clearCache(flowCode?: string): void {
    if (flowCode) {
      this.flowCache.delete(flowCode);
      this.logger.log(`已清除流程缓存: ${flowCode}`);
    } else {
      this.flowCache.clear();
      this.logger.log('已清除所有流程缓存');
    }
  }
}


import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
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

  /**
   * 生成 16 位唯一 key
   */
  private generateKey(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    const length = 16;
    let result = '';
    
    // 确保第一个字符是字母
    const randomByte = randomBytes(1)[0];
    result += chars.substring(10, 36)[randomByte % 26];
    
    // 生成剩余的15个字符
    const randomBytesBuffer = randomBytes(15);
    for (let i = 0; i < 15; i++) {
      result += chars[randomBytesBuffer[i] % chars.length];
    }
    
    return result;
  }

  /**
   * 检查 key 是否已存在
   */
  private async isKeyExists(key: string): Promise<boolean> {
    const flow = await this.codeFlowRepository.findOne({ where: { key } });
    return !!flow;
  }

  /**
   * 获取唯一的 key
   */
  private async getUniqueKey(): Promise<string> {
    let key = this.generateKey();
    let exists = await this.isKeyExists(key);
    
    while (exists) {
      key = this.generateKey();
      exists = await this.isKeyExists(key);
    }
    
    return key;
  }

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
   * @param flowKey 流程唯一标识
   * @param params 输入参数
   * @param user 当前用户
   */
  async executeFlow(flowKey: string, params: any, user?: any): Promise<any> {
    this.logger.log(`执行代码流程: ${flowKey}`);

    // 从数据库获取代码流程
    const flow = await this.codeFlowRepository.findOne({
      where: { key: flowKey, status: 1 }, // 只执行启用状态的流程
    });

    if (!flow) {
      throw new NotFoundException(`代码流程 ${flowKey} 不存在或已禁用`);
    }

    // 获取流程代码（支持缓存）
    const flowFunction = await this.compileFlowCode(
      flow.key,
      flow.code,
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
      this.logger.log(`代码流程执行成功: ${flowKey}`);
      return result;
    } catch (error) {
      this.logger.error(`代码流程执行失败: ${flowKey}`, error);
      throw error;
    }
  }

  /**
   * 编译代码流程
   * 使用 VM 模块安全地执行数据库中的代码
   */
  private async compileFlowCode(
    flowKey: string,
    code: string,
    updatedAt: Date,
  ): Promise<Function> {
    // 检查缓存
    const cached = this.flowCache.get(flowKey);
    if (cached && cached.timestamp >= updatedAt.getTime()) {
      // 使用缓存的代码
      return this.createFunctionFromCode(cached.code);
    }

    // 缓存新代码
    this.flowCache.set(flowKey, {
      code: code,
      timestamp: updatedAt.getTime(),
    });

    return this.createFunctionFromCode(code);
  }

  /**
   * 从代码字符串创建可执行函数
   */
  private createFunctionFromCode(code: string): Function {
    try {
      // 使用 VM 模块创建沙箱环境执行代码
      const script = new vm.Script(
        `(async function(context) { ${code} })`,
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
        'key',
        'name',
        'category',
        'description',
        'status',
        'createdAt',
        'updatedAt',
      ],
      order: {
        category: 'ASC',
        key: 'ASC',
      },
    });

    return flows;
  }

  /**
   * 查询单个流程详情
   */
  async getFlow(key: string): Promise<CodeFlow> {
    const flow = await this.codeFlowRepository.findOne({
      where: { key },
    });

    if (!flow) {
      throw new NotFoundException(`代码流程 ${key} 不存在`);
    }

    return flow;
  }

  /**
   * 创建代码流程
   */
  async createFlow(data: Partial<CodeFlow>): Promise<CodeFlow> {
    // 如果没有提供 key，自动生成
    if (!data.key) {
      data.key = await this.getUniqueKey();
    }
    
    // 默认值
    if (!data.code) {
      data.code = this.getDefaultCodeTemplate(
        data.key || await this.getUniqueKey(),
        data.name || '新流程',
        data.description || ''
      );
    }
    if (data.status === undefined) {
      data.status = 1;
    }
    
    const flow = this.codeFlowRepository.create(data);
    const saved = await this.codeFlowRepository.save(flow);
    
    this.logger.log(`代码流程已创建: ${saved.key} - ${saved.name}`);
    
    return saved;
  }

  /**
   * 获取默认代码模板
   */
  private getDefaultCodeTemplate(flowKey: string, flowName: string, description: string): string {
    const now = new Date();
    const updateTime = this.formatDateTime(now);
    
    return `/**
 * @flowKey ${flowKey}
 * @flowName ${flowName}
 * @description ${description || flowName}
 * @updateTime ${updateTime}
 */

// 解构上下文
const { repositories, params, user } = context;

// 参数校验
if (!params.xxx) {
  throw new Error('xxx 不能为空');
}

// 业务逻辑
// ...

// 返回结果
return {
  success: true,
  data: {},
  message: '操作成功',
};
`;
  }

  /**
   * 更新代码流程
   */
  async updateFlow(
    key: string,
    data: Partial<CodeFlow>,
  ): Promise<CodeFlow> {
    const flow = await this.codeFlowRepository.findOne({
      where: { key },
    });

    if (!flow) {
      throw new NotFoundException(`代码流程 ${key} 不存在`);
    }

    Object.assign(flow, data);
    return await this.codeFlowRepository.save(flow);
  }

  /**
   * 删除/禁用代码流程
   */
  async deleteFlow(key: string): Promise<void> {
    const flow = await this.codeFlowRepository.findOne({
      where: { key },
    });

    if (!flow) {
      throw new NotFoundException(`代码流程 ${key} 不存在`);
    }

    // 软删除：将状态设置为禁用
    flow.status = 0;
    await this.codeFlowRepository.save(flow);

    // 清除缓存
    this.flowCache.delete(key);
  }

  /**
   * 清除流程缓存
   */
  clearCache(flowKey?: string): void {
    if (flowKey) {
      this.flowCache.delete(flowKey);
      this.logger.log(`已清除流程缓存: ${flowKey}`);
    } else {
      this.flowCache.clear();
      this.logger.log('已清除所有流程缓存');
    }
  }

  /**
   * 上传代码（erp-code 项目使用）
   * 
   * @updateTime 机制说明：
   * 1. 创建时：代码文件中的 @updateTime 会被写入数据库 updatedAt
   * 2. 更新时：对比代码文件中的 @updateTime 和数据库中的 updatedAt
   *    - 如果一致：允许更新，并更新数据库时间
   *    - 如果不一致：拒绝更新（说明其他人已修改，防止覆盖）
   * 3. 这是一种乐观锁机制，防止多人协作时的并发冲突
   */
  async uploadCode(data: any): Promise<any> {
    const { filePath, code, key, name, category, description, updateTime } = data;

    this.logger.log(`接收代码上传: ${key || filePath}`);

    // 检查是否已存在
    const existingFlow = await this.codeFlowRepository.findOne({
      where: { key },
    });

    if (existingFlow) {
      // === 更新现有流程 ===
      
      // 乐观锁检查：对比 updateTime
      if (updateTime) {
        const dbUpdateTime = this.formatDateTime(existingFlow.updatedAt);
        
        if (updateTime !== dbUpdateTime) {
          this.logger.warn(
            `更新时间冲突: 文件=${updateTime}, 数据库=${dbUpdateTime}, 流程=${key}`
          );
          
          return {
            success: false,
            action: 'conflict',
            message: `更新时间不一致，代码可能已被他人修改。\n文件时间: ${updateTime}\n数据库时间: ${dbUpdateTime}\n请刷新后重新编辑！`,
            data: {
              fileUpdateTime: updateTime,
              dbUpdateTime: dbUpdateTime,
              key: key,
            },
          };
        }
      }

      // 更新流程
      existingFlow.code = code;
      existingFlow.name = name || existingFlow.name;
      existingFlow.category = category || existingFlow.category;
      existingFlow.description = description || existingFlow.description;
      existingFlow.updatedBy = data.userId || null;

      const updated = await this.codeFlowRepository.save(existingFlow);

      // 清除缓存
      this.clearCache(key);

      this.logger.log(`代码流程已更新: ${key}`);

      return {
        success: true,
        action: 'updated',
        data: {
          id: updated.id,
          key: updated.key,
          name: updated.name,
          updateTime: this.formatDateTime(updated.updatedAt),
        },
        message: '代码流程已更新',
      };
    } else {
      // === 创建新流程 ===
      const newFlow = await this.codeFlowRepository.save({
        key,
        name: name || key,
        category,
        description,
        code,
        status: 1,
        createdBy: data.userId || null,
      });

      this.logger.log(`代码流程已创建: ${key}`);

      return {
        success: true,
        action: 'created',
        data: {
          id: newFlow.id,
          key: newFlow.key,
          name: newFlow.name,
          updateTime: this.formatDateTime(newFlow.updatedAt),
        },
        message: '代码流程已创建',
      };
    }
  }

  /**
   * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
   */
  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Log } from '../../entities/log.entity';

export interface CreateLogDto {
  userId?: number;
  username?: string;
  module: string;
  action: string;
  targetId?: number;
  content?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  requestBody?: string;
  responseBody?: string;
  status?: string;
  errorMsg?: string;
  duration?: number;
}

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  /**
   * 创建日志（异步，不阻塞主流程）
   */
  async create(dto: CreateLogDto): Promise<void> {
    try {
      await this.logRepository.save(this.logRepository.create(dto));
    } catch (error) {
      console.error('日志写入失败:', error);
    }
  }

  /**
   * 查询日志列表
   */
  async findList(query: {
    page?: number;
    pageSize?: number;
    module?: string;
    action?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, pageSize = 20, module, action, userId, startDate, endDate } = query;

    const qb = this.logRepository.createQueryBuilder('log');

    if (module) qb.andWhere('log.module = :module', { module });
    if (action) qb.andWhere('log.action = :action', { action });
    if (userId) qb.andWhere('log.userId = :userId', { userId });
    if (startDate) qb.andWhere('log.createdAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('log.createdAt <= :endDate', { endDate });

    qb.orderBy('log.createdAt', 'DESC');

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 清理过期日志
   */
  async cleanExpiredLogs(days: number = 30): Promise<number> {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() - days);

    const result = await this.logRepository.delete({
      createdAt: LessThan(expireDate),
    });

    return result.affected || 0;
  }

  /**
   * 查询单条日志详情
   */
  async findOne(id: number): Promise<Log | null> {
    return this.logRepository.findOne({ where: { id } });
  }

  /**
   * 获取某个业务对象的操作历史
   */
  async getTargetHistory(module: string, targetId: number) {
    return this.logRepository.find({
      where: { module, targetId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}

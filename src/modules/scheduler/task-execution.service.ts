import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskExecution } from '../../entities/task-execution.entity';

@Injectable()
export class TaskExecutionService {
  constructor(
    @InjectRepository(TaskExecution)
    private readonly repository: Repository<TaskExecution>,
  ) {}

  /**
   * 记录任务执行
   */
  async record(data: {
    taskName: string;
    executedAt: Date;
    duration: number;
    success: boolean;
    result?: string;
    error?: string;
    triggerType?: 'cron' | 'manual';
  }): Promise<TaskExecution> {
    const execution = this.repository.create({
      ...data,
      triggerType: data.triggerType || 'cron',
    });
    return this.repository.save(execution);
  }

  /**
   * 获取任务最近执行记录
   */
  async getLatest(taskName: string, limit = 10): Promise<TaskExecution[]> {
    return this.repository.find({
      where: { taskName },
      order: { executedAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取所有任务的最近一次执行
   */
  async getLatestByTask(): Promise<Record<string, TaskExecution>> {
    const tasks = await this.repository
      .createQueryBuilder('t')
      .select('DISTINCT t.task_name', 'taskName')
      .getRawMany();

    const result: Record<string, TaskExecution> = {};

    for (const { taskName } of tasks) {
      const latest = await this.repository.findOne({
        where: { taskName },
        order: { executedAt: 'DESC' },
      });
      if (latest) {
        result[taskName] = latest;
      }
    }

    return result;
  }

  /**
   * 清理旧的执行记录（保留最近 N 天）
   */
  async cleanOldRecords(days = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('executed_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}

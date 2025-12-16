import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LogService } from '../../log/log.service';
import { TaskExecutionService } from '../task-execution.service';

/** 日志保留天数 */
const LOG_RETENTION_DAYS = 7;
const TASK_NAME = 'log-cleanup';

/**
 * 日志清理定时任务
 * - 每天 00:05 执行
 * - 清理超过 7 天的日志
 */
@Injectable()
export class LogCleanupTask {
  private readonly logger = new Logger(LogCleanupTask.name);

  constructor(
    private readonly logService: LogService,
    private readonly taskExecutionService: TaskExecutionService,
  ) {}

  /**
   * 每天 00:05 执行日志清理
   */
  @Cron('5 0 * * *')
  async handleLogCleanup() {
    await this.execute('cron');
  }

  /**
   * 手动触发清理
   */
  async manualCleanup(days?: number): Promise<number> {
    return this.execute('manual', days);
  }

  private async execute(
    triggerType: 'cron' | 'manual',
    days?: number,
  ): Promise<number> {
    const startTime = Date.now();
    const executedAt = new Date();
    const retentionDays = days ?? LOG_RETENTION_DAYS;

    this.logger.log(
      `[${triggerType}] 开始清理 ${retentionDays} 天前的日志...`,
    );

    try {
      const deletedCount =
        await this.logService.cleanExpiredLogs(retentionDays);
      const duration = Date.now() - startTime;

      await this.taskExecutionService.record({
        taskName: TASK_NAME,
        executedAt,
        duration,
        success: true,
        result: `删除 ${deletedCount} 条日志`,
        triggerType,
      });

      this.logger.log(
        `[${triggerType}] 日志清理完成，删除 ${deletedCount} 条，耗时 ${duration}ms`,
      );

      return deletedCount;
    } catch (error) {
      const duration = Date.now() - startTime;

      await this.taskExecutionService.record({
        taskName: TASK_NAME,
        executedAt,
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        triggerType,
      });

      this.logger.error(`[${triggerType}] 日志清理失败:`, error);
      throw error;
    }
  }
}

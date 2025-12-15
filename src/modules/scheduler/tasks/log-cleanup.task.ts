import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LogService } from '../../log/log.service';

/** 日志保留天数 */
const LOG_RETENTION_DAYS = 7;

export interface TaskExecutionRecord {
  taskName: string;
  executedAt: Date;
  duration: number;
  success: boolean;
  result?: string;
  error?: string;
}

/**
 * 日志清理定时任务
 * - 每天 00:05 执行
 * - 清理超过 30 天的日志
 */
@Injectable()
export class LogCleanupTask {
  private readonly logger = new Logger(LogCleanupTask.name);
  private lastExecution: TaskExecutionRecord | null = null;

  constructor(private readonly logService: LogService) {}

  /**
   * 每天 00:05 执行日志清理
   */
  @Cron('5 0 * * *')
  async handleLogCleanup() {
    const startTime = Date.now();
    const retentionDays = LOG_RETENTION_DAYS;

    this.logger.log(`[定时任务] 开始清理 ${retentionDays} 天前的日志...`);

    try {
      const deletedCount =
        await this.logService.cleanExpiredLogs(retentionDays);
      const duration = Date.now() - startTime;

      this.lastExecution = {
        taskName: 'log-cleanup',
        executedAt: new Date(),
        duration,
        success: true,
        result: `删除 ${deletedCount} 条日志`,
      };

      this.logger.log(
        `[定时任务] 日志清理完成，删除 ${deletedCount} 条，耗时 ${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.lastExecution = {
        taskName: 'log-cleanup',
        executedAt: new Date(),
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      this.logger.error('[定时任务] 日志清理失败:', error);
    }
  }

  /**
   * 获取上次执行记录
   */
  getLastExecution(): TaskExecutionRecord | null {
    return this.lastExecution;
  }

  /**
   * 手动触发清理
   */
  async manualCleanup(days?: number): Promise<number> {
    const retentionDays = days ?? LOG_RETENTION_DAYS;

    this.logger.log(`[手动触发] 清理 ${retentionDays} 天前的日志...`);
    const deletedCount = await this.logService.cleanExpiredLogs(retentionDays);
    this.logger.log(`[手动触发] 清理完成，删除 ${deletedCount} 条`);

    return deletedCount;
  }
}

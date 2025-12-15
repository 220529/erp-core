import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

export interface TaskInfo {
  name: string;
  running: boolean;
  lastDate: Date | null;
  nextDate: Date | null;
}

/**
 * 定时任务管理服务
 * - 查看所有任务状态
 * - 动态启停任务
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private schedulerRegistry: SchedulerRegistry) {}

  /**
   * 获取所有 Cron 任务状态
   */
  getAllCronJobs(): TaskInfo[] {
    const jobs = this.schedulerRegistry.getCronJobs();
    const result: TaskInfo[] = [];

    jobs.forEach((job, name) => {
      result.push({
        name,
        running: (job as any).running ?? false,
        lastDate: job.lastDate(),
        nextDate: job.nextDate()?.toJSDate() ?? null,
      });
    });

    return result;
  }

  /**
   * 停止指定任务
   */
  stopCronJob(name: string): boolean {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.stop();
      this.logger.log(`任务 [${name}] 已停止`);
      return true;
    } catch (error) {
      this.logger.error(`停止任务 [${name}] 失败:`, error);
      return false;
    }
  }

  /**
   * 启动指定任务
   */
  startCronJob(name: string): boolean {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.start();
      this.logger.log(`任务 [${name}] 已启动`);
      return true;
    } catch (error) {
      this.logger.error(`启动任务 [${name}] 失败:`, error);
      return false;
    }
  }

  /**
   * 删除 Cron 任务
   */
  deleteCronJob(name: string): boolean {
    try {
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.log(`任务 [${name}] 已删除`);
      return true;
    } catch (error) {
      this.logger.error(`删除任务 [${name}] 失败:`, error);
      return false;
    }
  }
}

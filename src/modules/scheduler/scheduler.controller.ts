import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogCleanupTask } from './tasks/log-cleanup.task';
import { SchedulerService } from './scheduler.service';

class ManualCleanupDto {
  days?: number;
}

@ApiTags('定时任务')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scheduler')
export class SchedulerController {
  constructor(
    private readonly logCleanupTask: LogCleanupTask,
    private readonly schedulerService: SchedulerService,
  ) {}

  @Get('tasks')
  @ApiOperation({ summary: '获取所有定时任务状态' })
  getAllTasks() {
    const tasks = this.schedulerService.getAllCronJobs();
    const lastExecution = this.logCleanupTask.getLastExecution();

    return {
      tasks,
      executions: {
        'log-cleanup': lastExecution,
      },
    };
  }

  @Post('tasks/:name/stop')
  @ApiOperation({ summary: '停止指定任务' })
  stopTask(@Param('name') name: string) {
    const success = this.schedulerService.stopCronJob(name);
    return { success, message: success ? '任务已停止' : '停止失败' };
  }

  @Post('tasks/:name/start')
  @ApiOperation({ summary: '启动指定任务' })
  startTask(@Param('name') name: string) {
    const success = this.schedulerService.startCronJob(name);
    return { success, message: success ? '任务已启动' : '启动失败' };
  }

  @Post('log-cleanup')
  @ApiOperation({ summary: '手动触发日志清理' })
  async triggerLogCleanup(@Body() dto: ManualCleanupDto) {
    const deletedCount = await this.logCleanupTask.manualCleanup(dto.days);
    return {
      message: '日志清理完成',
      deletedCount,
    };
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskExecution } from '../../entities/task-execution.entity';
import { LogCleanupTask } from './tasks/log-cleanup.task';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { TaskExecutionService } from './task-execution.service';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([TaskExecution])],
  controllers: [SchedulerController],
  providers: [LogCleanupTask, SchedulerService, TaskExecutionService],
  exports: [LogCleanupTask, SchedulerService, TaskExecutionService],
})
export class SchedulerModule {}

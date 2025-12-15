import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LogCleanupTask } from './tasks/log-cleanup.task';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [SchedulerController],
  providers: [LogCleanupTask, SchedulerService],
  exports: [LogCleanupTask, SchedulerService],
})
export class SchedulerModule {}

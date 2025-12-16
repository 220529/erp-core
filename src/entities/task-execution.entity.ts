import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

/**
 * 定时任务执行记录
 */
@Entity({ name: 'task_executions', comment: '定时任务执行记录表' })
@Index(['taskName'])
@Index(['executedAt'])
export class TaskExecution extends BaseEntity {
  @Column({ name: 'task_name', length: 50, comment: '任务名称' })
  taskName: string;

  @Column({ name: 'executed_at', type: 'datetime', comment: '执行时间' })
  executedAt: Date;

  @Column({ comment: '执行耗时(毫秒)' })
  duration: number;

  @Column({ default: true, comment: '是否成功' })
  success: boolean;

  @Column({ type: 'text', nullable: true, comment: '执行结果' })
  result: string;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  error: string;

  @Column({ name: 'trigger_type', length: 20, default: 'cron', comment: '触发类型: cron/manual' })
  triggerType: string;
}

import { SetMetadata } from '@nestjs/common';

export const OPERATION_LOG_KEY = 'operation_log';

export interface OperationLogOptions {
  module: string; // 模块名
  action: string; // 操作类型: create/update/delete
  description?: string; // 操作描述
}

/**
 * 操作日志装饰器
 * @example @OperationLog({ module: 'customer', action: 'create', description: '创建客户' })
 */
export const OperationLog = (options: OperationLogOptions) =>
  SetMetadata(OPERATION_LOG_KEY, options);

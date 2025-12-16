import { SetMetadata } from '@nestjs/common';

export const OPERATION_LOG_KEY = 'operation_log';

export interface OperationLogOptions {
  /** 操作名称 */
  action: string;
  /** 业务模块 */
  module?: string;
  /** 从哪个参数取业务ID，如 'id', 'orderId' */
  targetIdParam?: string;
  /** 是否记录请求体 */
  recordRequest?: boolean;
  /** 是否记录响应体 */
  recordResponse?: boolean;
  /** 动态描述生成函数 */
  description?: string | ((req: any) => string);
}

/**
 * 操作日志装饰器
 * @example
 * // 简单用法
 * @OperationLog('创建订单')
 * 
 * // 完整配置
 * @OperationLog({
 *   action: '订单签约',
 *   module: 'order',
 *   targetIdParam: 'id',
 *   recordRequest: true,
 * })
 */
export function OperationLog(options: string | OperationLogOptions): MethodDecorator {
  const opts: OperationLogOptions =
    typeof options === 'string' ? { action: options } : options;

  return SetMetadata(OPERATION_LOG_KEY, {
    action: opts.action,
    module: opts.module || 'system',
    targetIdParam: opts.targetIdParam || 'id',
    recordRequest: opts.recordRequest ?? true,
    recordResponse: opts.recordResponse ?? false,
    description: opts.description,
  });
}

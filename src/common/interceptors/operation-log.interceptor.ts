import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap, catchError } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../../entities/log.entity';
import {
  OPERATION_LOG_KEY,
  OperationLogOptions,
} from '../decorators/operation-log.decorator';

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.reflector.get<OperationLogOptions>(
      OPERATION_LOG_KEY,
      context.getHandler(),
    );

    // 没有装饰器，直接放行
    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    // 提取基础信息
    const logData: Partial<Log> = {
      action: options.action,
      module: options.module,
      method: request.method,
      path: request.url,
      ip: this.getClientIp(request),
      userId: request.user?.id || undefined,
      username: request.user?.name || request.user?.username || undefined,
      targetId: this.getTargetId(request, options.targetIdParam || 'id') || undefined,
      requestBody: options.recordRequest
        ? this.safeStringify(this.sanitizeBody(request.body)) || undefined
        : undefined,
      content:
        typeof options.description === 'function'
          ? options.description(request)
          : options.description || undefined,
    };

    return next.handle().pipe(
      tap((response) => {
        // 成功时记录日志
        this.saveLog({
          ...logData,
          status: 'success',
          responseBody: options.recordResponse
            ? this.safeStringify(response) || undefined
            : undefined,
          duration: Date.now() - startTime,
        });
      }),
      catchError((error) => {
        // 失败时记录日志
        this.saveLog({
          ...logData,
          status: 'error',
          errorMsg: error.message || String(error),
          duration: Date.now() - startTime,
        });
        throw error;
      }),
    );
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip ||
      ''
    );
  }

  private getTargetId(request: any, paramName: string): number | null {
    const id =
      request.params?.[paramName] ||
      request.body?.[paramName] ||
      request.query?.[paramName];
    return id ? Number(id) : null;
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    // 移除敏感字段
    const sensitiveFields = ['password', 'token', 'secret', 'credential'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });
    return sanitized;
  }

  private safeStringify(obj: any): string | null {
    if (!obj) return null;
    try {
      const str = JSON.stringify(obj);
      // 限制长度，避免存储过大
      return str.length > 10000 ? str.substring(0, 10000) + '...[truncated]' : str;
    } catch {
      return null;
    }
  }

  private async saveLog(data: Partial<Log>): Promise<void> {
    try {
      const log = this.logRepository.create(data);
      await this.logRepository.save(log);
    } catch (error) {
      // 日志保存失败不影响业务
      console.error('保存操作日志失败:', error);
    }
  }
}

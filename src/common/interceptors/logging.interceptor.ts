import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

/**
 * 日志拦截器
 * 记录请求和响应日志
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  // 不记录日志的路径
  private readonly excludePaths = ['/api/health', '/health'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query, params } = request;
    const startTime = Date.now();

    // 跳过健康检查等路径的日志
    const shouldSkipLogging = this.excludePaths.some((path) =>
      url.startsWith(path),
    );

    if (!shouldSkipLogging) {
      this.logger.log(
        `[${method}] ${url} - Request: ${JSON.stringify({
          body,
          query,
          params,
        })}`,
      );
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          if (!shouldSkipLogging) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            this.logger.log(
              `[${method}] ${url} - Response (${duration}ms): ${JSON.stringify(data).substring(0, 200)}`,
            );
          }
        },
        // 错误由 HttpExceptionFilter 统一处理，这里不重复打印
      }),
    );
  }
}


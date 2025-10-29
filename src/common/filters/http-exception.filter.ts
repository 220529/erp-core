import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 全局HTTP异常过滤器
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 500;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message =
          (exceptionResponse as any).message ||
          exception.message ||
          'Request failed';
        code = (exceptionResponse as any).code || status;
      } else {
        message = exception.message;
        code = status;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 记录错误日志（开发环境打印堆栈，生产环境不打印）
    const isDev = process.env.NODE_ENV === 'development';
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
      isDev && exception instanceof Error ? exception.stack : '',
    );

    // 统一响应格式
    response.status(status).json({
      code,
      message,
      data: null,
      timestamp: Date.now(),
      path: request.url,
    });
  }
}


import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常类
 */
export class BusinessException extends HttpException {
  constructor(message: string, code: number = 400) {
    super(
      {
        code,
        message,
        timestamp: Date.now(),
      },
      HttpStatus.OK, // 业务异常统一返回200状态码，通过code区分
    );
  }
}


import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPaymentDto {
  @ApiPropertyOptional({ description: '收款单号', example: 'PAY' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '收款状态', example: 'confirmed' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '订单ID', example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  orderId?: number;

  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10, default: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 10;
}


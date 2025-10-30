import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryOrderDto {
  @ApiPropertyOptional({ description: '关键词搜索（订单号）', example: 'ORD' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '订单状态', example: 'signed' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '客户ID', example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  customerId?: number;

  @ApiPropertyOptional({ description: '销售人员ID', example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  salesId?: number;

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


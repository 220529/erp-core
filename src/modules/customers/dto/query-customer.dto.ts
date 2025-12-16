import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCustomerDto {
  @ApiPropertyOptional({ description: '关键词搜索（名称、联系人、手机号）', example: '张三' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '客户阶段', example: 'lead' })
  @IsString()
  @IsOptional()
  stage?: string;

  @ApiPropertyOptional({ description: '设计师ID', example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  designerId?: number;

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


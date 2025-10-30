import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProjectDto {
  @ApiPropertyOptional({ description: '关键词搜索（项目号、项目名称）', example: 'PRJ' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '项目状态', example: 'in_progress' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '订单ID', example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  orderId?: number;

  @ApiPropertyOptional({ description: '工长ID', example: 3 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  foremanId?: number;

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


import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMaterialDto {
  @ApiPropertyOptional({ description: '关键词搜索（名称、品牌、规格）', example: '瓷砖' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '物料分类', example: 'main' })
  @IsString()
  @IsOptional()
  category?: string;

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


import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建字典类型 DTO
 */
export class CreateDictTypeDto {
  @ApiProperty({ description: '字典类型编码', example: 'customer_source' })
  @IsString()
  @IsNotEmpty({ message: '字典类型编码不能为空' })
  code: string;

  @ApiProperty({ description: '字典类型名称', example: '客户来源' })
  @IsString()
  @IsNotEmpty({ message: '字典类型名称不能为空' })
  name: string;

  @ApiPropertyOptional({ description: '排序序号', example: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 更新字典类型 DTO
 */
export class UpdateDictTypeDto {
  @ApiPropertyOptional({ description: '字典类型名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '排序序号' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({ description: '状态: 1-启用 0-禁用' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 查询字典类型 DTO
 */
export class QueryDictTypeDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;

  @ApiPropertyOptional({ description: '字典类型名称（模糊搜索）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '字典类型编码（模糊搜索）' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  status?: number;
}


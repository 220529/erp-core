import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建字典数据 DTO
 */
export class CreateDictDataDto {
  @ApiProperty({ description: '字典类型编码', example: 'customer_source' })
  @IsString()
  @IsNotEmpty({ message: '字典类型编码不能为空' })
  typeCode: string;

  @ApiProperty({ description: '字典标签', example: '线上' })
  @IsString()
  @IsNotEmpty({ message: '字典标签不能为空' })
  label: string;

  @ApiProperty({ description: '字典值', example: 'online' })
  @IsString()
  @IsNotEmpty({ message: '字典值不能为空' })
  value: string;

  @ApiPropertyOptional({ description: '排序序号', example: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({ description: '样式类型' })
  @IsOptional()
  @IsString()
  cssClass?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 更新字典数据 DTO
 */
export class UpdateDictDataDto {
  @ApiPropertyOptional({ description: '字典标签' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: '字典值' })
  @IsOptional()
  @IsString()
  value?: string;

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

  @ApiPropertyOptional({ description: '样式类型' })
  @IsOptional()
  @IsString()
  cssClass?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 查询字典数据 DTO
 */
export class QueryDictDataDto {
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

  @ApiPropertyOptional({ description: '字典类型编码' })
  @IsOptional()
  @IsString()
  typeCode?: string;

  @ApiPropertyOptional({ description: '字典标签（模糊搜索）' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  status?: number;
}


import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductMaterialDto {
  @ApiProperty({ description: '产品ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: '物料ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  materialId: number;

  @ApiProperty({ description: '数量', example: 10 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: '单位', example: '片' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: '单价', example: 88.5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdateProductMaterialDto {
  @ApiPropertyOptional({ description: '数量', example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ description: '单位', example: '片' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: '单价', example: 88.5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}


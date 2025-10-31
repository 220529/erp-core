import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({ description: '物料名称', example: '瓷砖' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '物料分类', example: 'main' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: '品牌', example: '马可波罗' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ description: '规格', example: '800x800mm' })
  @IsString()
  @IsOptional()
  spec?: string;

  @ApiPropertyOptional({ description: '单位', example: '片' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: '成本价', example: 50.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ description: '销售价', example: 88.5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ description: '图片URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}


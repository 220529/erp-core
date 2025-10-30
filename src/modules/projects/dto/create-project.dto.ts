import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: '订单ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ description: '客户ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({ description: '项目名称', example: '朝阳区别墅装修' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '施工地址', example: '北京市朝阳区xxx小区' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: '工长ID', example: 3 })
  @IsNumber()
  @IsOptional()
  foremanId?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}


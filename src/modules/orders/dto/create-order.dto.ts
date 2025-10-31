import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: '客户ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @ApiPropertyOptional({ description: '订单总金额', example: 50000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({ description: '销售人员ID', example: 1 })
  @IsNumber()
  @IsOptional()
  salesId?: number;

  @ApiPropertyOptional({ description: '设计师ID', example: 2 })
  @IsNumber()
  @IsOptional()
  designerId?: number;

  @ApiPropertyOptional({ description: '工长ID', example: 3 })
  @IsNumber()
  @IsOptional()
  foremanId?: number;

  @ApiPropertyOptional({ description: '签约时间', example: '2025-10-30' })
  @IsDateString()
  @IsOptional()
  signedAt?: Date;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}


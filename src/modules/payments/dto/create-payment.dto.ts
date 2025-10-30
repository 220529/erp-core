import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: '订单ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ description: '收款金额', example: 10000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: '收款类型', example: 'deposit' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: '收款方式', example: '微信' })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({ description: '收款时间', example: '2025-10-30' })
  @IsDateString()
  @IsOptional()
  paidAt?: Date;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}


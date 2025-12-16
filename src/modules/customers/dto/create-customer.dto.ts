import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Length, IsEmail, IsMobilePhone } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ description: '客户名称', example: '张三' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ description: '联系人', example: '李四' })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  contact?: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsOptional()
  @IsMobilePhone('zh-CN')
  mobile?: string;

  @ApiPropertyOptional({ description: '邮箱', example: 'example@email.com' })
  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '地址', example: '北京市朝阳区' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: '区域', example: '朝阳区' })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({ description: '客户来源', example: '网络推广' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: '客户阶段', example: 'lead' })
  @IsString()
  @IsOptional()
  stage?: string;

  @ApiPropertyOptional({ description: '设计师ID', example: 1 })
  @IsNumber()
  @IsOptional()
  designerId?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}


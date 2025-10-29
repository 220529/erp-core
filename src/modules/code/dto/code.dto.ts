import {
  IsObject,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExecuteFlowDto {
  @ApiProperty({
    description: '业务流程参数',
    example: { customerId: 1, content: '客户跟进记录' },
  })
  @IsObject()
  params: any;
}

export class CreateFlowDto {
  @ApiProperty({ description: '流程编码', example: '01_客户录入' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '流程名称', example: '客户录入' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '流程分类', example: '客户管理' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: '流程描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '流程代码',
    example: `const { repositories, params } = context;
const { customerRepository } = repositories;
const customer = customerRepository.create(params);
await customerRepository.save(customer);
return customer;`,
  })
  @IsString()
  @IsNotEmpty()
  codeContent: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdateFlowDto {
  @ApiPropertyOptional({ description: '流程名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '流程分类' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: '流程描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '流程代码' })
  @IsString()
  @IsOptional()
  codeContent?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}


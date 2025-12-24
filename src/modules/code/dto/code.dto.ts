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
  @ApiPropertyOptional({ description: '流程唯一标识key（不提供则自动生成）', example: 'customer/create' })
  @IsString()
  @IsOptional()
  key?: string;

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

  @ApiPropertyOptional({
    description: '流程代码（不提供则生成默认模板）',
    example: `const { repositories, params } = context;
const { customerRepository } = repositories;
const customer = customerRepository.create(params);
await customerRepository.save(customer);
return customer;`,
  })
  @IsString()
  @IsOptional()
  code?: string;

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
  code?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '状态: 1-启用 0-禁用' })
  @IsNumber()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '发布时间' })
  @IsString()
  @IsOptional()
  publishedAt?: string;
}

/**
 * 上传代码 DTO（用于 erp-code 项目的自动上传）
 */
export class UploadCodeDto {
  @ApiPropertyOptional({
    description: '文件路径（相对于 erp-code/src/flows/），发布时可选',
    example: '订单管理/创建订单.js',
  })
  @IsString()
  @IsOptional()
  filePath?: string;

  @ApiProperty({
    description: '代码内容',
    example: `// 订单创建逻辑
const { repositories, params } = context;
// ... 业务代码 ...`,
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: '流程唯一标识key（从注释中解析）',
    example: 'customer/create',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: '流程名称（从注释中解析）',
    example: '创建客户',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: '流程分类（从路径中解析）',
    example: '客户管理',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: '流程描述（从注释中解析）',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: '更新时间（从注释中解析，用于乐观锁）',
    example: '2025-10-30 12:00:00',
  })
  @IsString()
  @IsOptional()
  updateTime?: string;

  @ApiPropertyOptional({
    description: '创建人/更新人 ID',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional({
    description: '请求时间戳（毫秒，用于防重放攻击，30分钟内有效）',
    example: 1730276382988,
  })
  @IsNumber()
  @IsOptional()
  timestamp?: number;

  @ApiPropertyOptional({
    description: '是否为发布操作（发布时设置 status=1 和 publishedAt）',
    example: true,
  })
  @IsOptional()
  isPublish?: boolean;
}

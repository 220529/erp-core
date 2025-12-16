import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { OperationLog } from '../../common/decorators/operation-log.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: '创建客户' })
  @RequirePermission('customer:create')
  @OperationLog({ module: 'customer', action: 'create', description: '创建客户' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get('export')
  @ApiOperation({ summary: '导出客户列表' })
  @RequirePermission('customer:export')
  @OperationLog({ module: 'customer', action: 'export', description: '导出客户列表' })
  async export(@Query() query: QueryCustomerDto, @Res() res: Response) {
    return this.customersService.export(res, query);
  }

  @Get()
  @ApiOperation({ summary: '查询客户列表' })
  @RequirePermission('customer:list')
  findAll(@Query() query: QueryCustomerDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询客户详情' })
  @RequirePermission('customer:list')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新客户' })
  @RequirePermission('customer:update')
  @OperationLog({ module: 'customer', action: 'update', description: '更新客户' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除客户' })
  @RequirePermission('customer:delete')
  @OperationLog({ module: 'customer', action: 'delete', description: '删除客户' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.customersService.remove(id);
    return { message: '删除成功' };
  }
}


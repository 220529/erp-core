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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { OperationLog } from '../../common/decorators/operation-log.decorator';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: '创建收款记录' })
  @RequirePermission('payment:create')
  @OperationLog({ action: '创建收款', module: 'payment', targetIdParam: 'orderId' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: '查询收款列表' })
  @RequirePermission('payment:list')
  findAll(@Query() query: QueryPaymentDto) {
    return this.paymentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询收款详情' })
  @RequirePermission('payment:list')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新收款记录' })
  @RequirePermission('payment:confirm')
  @OperationLog({ action: '更新收款', module: 'payment' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除收款记录' })
  @RequirePermission('payment:delete')
  @OperationLog({ action: '删除收款', module: 'payment' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.paymentsService.remove(id);
    return { message: '删除成功' };
  }
}


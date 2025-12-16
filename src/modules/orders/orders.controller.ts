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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { OrderMaterial } from '../../entities/order-material.entity';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @InjectRepository(OrderMaterial)
    private readonly orderMaterialRepository: Repository<OrderMaterial>,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @RequirePermission('order:create')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: '查询订单列表' })
  @RequirePermission('order:list')
  findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询订单详情' })
  @RequirePermission('order:list')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新订单' })
  @RequirePermission('order:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除订单' })
  @RequirePermission('order:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.ordersService.remove(id);
    return { message: '删除成功' };
  }

  @Get(':id/materials')
  @ApiOperation({ summary: '获取订单物料明细' })
  @RequirePermission('order:list')
  async getMaterials(@Param('id', ParseIntPipe) id: number) {
    return this.orderMaterialRepository.find({
      where: { orderId: id },
      order: { category: 'ASC', id: 'ASC' },
    });
  }
}


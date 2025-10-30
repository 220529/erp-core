import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../common/constants';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNo = await this.generateOrderNo();
    
    const order = this.orderRepository.create({
      ...createOrderDto,
      orderNo,
      status: OrderStatus.DRAFT,
      paidAmount: createOrderDto.paidAmount || 0,
    });
    
    return await this.orderRepository.save(order);
  }

  async findAll(query: QueryOrderDto) {
    const { keyword, status, customerId, salesId, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer');

    if (keyword) {
      queryBuilder.where('order.orderNo LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId });
    }

    if (salesId) {
      queryBuilder.andWhere('order.salesId = :salesId', { salesId });
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('order.createdAt', 'DESC');

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!order) {
      throw new NotFoundException(`订单 #${id} 不存在`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  private async generateOrderNo(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${dateStr}${random}`;
  }
}


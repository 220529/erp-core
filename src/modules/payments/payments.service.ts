import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { PaymentType, PaymentStatus } from '../../common/constants';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const paymentNo = await this.generatePaymentNo();
    
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      paymentNo,
      type: (createPaymentDto.type as PaymentType) || PaymentType.DEPOSIT,
      status: PaymentStatus.PENDING,
    });
    
    return await this.paymentRepository.save(payment);
  }

  async findAll(query: QueryPaymentDto) {
    const { keyword, status, orderId, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoin('users', 'creator', 'creator.id = payment.created_by')
      .addSelect('creator.name', 'creatorName');

    if (keyword) {
      queryBuilder.where('payment.paymentNo LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    if (orderId) {
      queryBuilder.andWhere('payment.orderId = :orderId', { orderId });
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('payment.createdAt', 'DESC');

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    // 合并创建人姓名到实体
    const list = entities.map((entity, index) => ({
      ...entity,
      createdByName: raw[index]?.creatorName || null,
    }));

    const total = await queryBuilder.getCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(`收款记录 #${id} 不存在`);
    }

    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return await this.paymentRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }

  /**
   * 生成收款单号
   * 规则：SK + YYYYMMDD + 4位随机数
   * 示例：SK202510310001
   */
  private async generatePaymentNo(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SK${dateStr}${random}`;
  }
}


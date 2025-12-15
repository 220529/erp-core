import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { Customer } from '../../entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { ExportService } from '../../common/services/export.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly exportService: ExportService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async findAll(query: QueryCustomerDto) {
    const { keyword, stage, salesId, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer');

    // 关键词搜索
    if (keyword) {
      queryBuilder.where(
        'customer.name LIKE :keyword OR customer.contact LIKE :keyword OR customer.mobile LIKE :keyword',
        { keyword: `%${keyword}%` }
      );
    }

    // 客户阶段筛选
    if (stage) {
      queryBuilder.andWhere('customer.stage = :stage', { stage });
    }

    // 销售人员筛选
    if (salesId) {
      queryBuilder.andWhere('customer.salesId = :salesId', { salesId });
    }

    // 分页
    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('customer.createdAt', 'DESC');

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`客户 #${id} 不存在`);
    }

    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }

  /**
   * 导出客户列表（使用实体装饰器配置）
   */
  async export(res: Response, query: QueryCustomerDto): Promise<void> {
    const { keyword, stage, salesId } = query;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer');

    if (keyword) {
      queryBuilder.where(
        'customer.name LIKE :keyword OR customer.mobile LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }
    if (stage) {
      queryBuilder.andWhere('customer.status = :stage', { stage });
    }
    if (salesId) {
      queryBuilder.andWhere('customer.salesId = :salesId', { salesId });
    }

    queryBuilder.orderBy('customer.createdAt', 'DESC');
    const data = await queryBuilder.getMany();

    const filename = `客户列表_${new Date().toISOString().slice(0, 10)}`;
    await this.exportService.exportFromEntity(res, Customer, data, filename);
  }
}


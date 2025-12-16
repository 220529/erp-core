import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { Order } from '../../entities/order.entity';
import { Product } from '../../entities/product.entity';
import { Payment } from '../../entities/payment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getStatistics() {
    // 获取本月时间范围
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 并行查询统计数据
    const [customerCount, orderCount, productCount, monthlyIncome] = await Promise.all([
      this.customerRepository.count(),
      this.orderRepository.count(),
      this.productRepository.count(),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.status = :status', { status: 'confirmed' })
        .andWhere('payment.paidAt BETWEEN :start AND :end', {
          start: startOfMonth,
          end: endOfMonth,
        })
        .getRawOne(),
    ]);

    return {
      customerCount,
      orderCount,
      productCount,
      monthlyIncome: parseFloat(monthlyIncome?.total || '0'),
    };
  }
}

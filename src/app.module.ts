import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CodeModule } from './modules/code/code.module';
import { ConstantsModule } from './modules/constants/constants.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { ProductsModule } from './modules/products/products.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DictModule } from './modules/dict/dict.module';

@Module({
  imports: [
    // 限流配置：防止暴力攻击
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 时间窗口：60秒
        limit: 100, // 限制：100次请求
      },
    ]),
    ConfigModule,
    DatabaseModule,
    AuthModule,
    CodeModule,
    ConstantsModule,
    CustomersModule,
    OrdersModule,
    MaterialsModule,
    ProductsModule,
    PaymentsModule,
    DictModule,
  ],
  providers: [
    // 全局限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

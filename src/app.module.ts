import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionModule } from './modules/permission/permission.module';
import { CodeModule } from './modules/code/code.module';
import { ConstantsModule } from './modules/constants/constants.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { ProductsModule } from './modules/products/products.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DictModule } from './modules/dict/dict.module';
import { FileModule } from './modules/file/file.module';
import { LogModule } from './modules/log/log.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { SystemModule } from './modules/system/system.module';
import { OperationLogInterceptor } from './common/interceptors/operation-log.interceptor';
import { HealthController } from './health.controller';

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
    PermissionModule,
    CodeModule,
    ConstantsModule,
    CustomersModule,
    OrdersModule,
    MaterialsModule,
    ProductsModule,
    PaymentsModule,
    DictModule,
    FileModule,
    LogModule,
    SchedulerModule,
    SystemModule,
  ],
  controllers: [HealthController],
  providers: [
    // 全局限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // 全局操作日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: OperationLogInterceptor,
    },
  ],
})
export class AppModule {}

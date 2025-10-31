import { Module } from '@nestjs/common';
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
})
export class AppModule {}

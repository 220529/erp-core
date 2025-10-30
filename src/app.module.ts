import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CodeModule } from './modules/code/code.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { DictModule } from './modules/dict/dict.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    CodeModule,
    CustomersModule,
    OrdersModule,
    MaterialsModule,
    PaymentsModule,
    ProjectsModule,
    DictModule,
  ],
})
export class AppModule {}

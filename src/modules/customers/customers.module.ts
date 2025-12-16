import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer } from '../../entities/customer.entity';
import { ExportService } from '../../common/services/export.service';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), PermissionModule],
  controllers: [CustomersController],
  providers: [CustomersService, ExportService],
  exports: [CustomersService],
})
export class CustomersModule {}


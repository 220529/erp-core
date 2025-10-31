import { Module } from '@nestjs/common';
import { CodeExecutorService } from './code-executor.service';
import { CodeController } from './code.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  Company,
  Department,
  Role,
  Customer,
  CustomerFollow,
  Material,
  Product,
  ProductMaterial,
  Order,
  OrderMaterial,
  Payment,
  File,
  DictType,
  DictData,
  Menu,
  RoleMenu,
  Log,
  CodeFlow,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Company,
      Department,
      Role,
      Customer,
      CustomerFollow,
      Material,
      Product,
      ProductMaterial,
      Order,
      OrderMaterial,
      Payment,
      File,
      DictType,
      DictData,
      Menu,
      RoleMenu,
      Log,
      CodeFlow,
    ]),
  ],
  controllers: [CodeController],
  providers: [CodeExecutorService],
  exports: [CodeExecutorService],
})
export class CodeModule {}


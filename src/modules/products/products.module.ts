import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../../entities/product.entity';
import { ProductMaterial } from '../../entities/product-material.entity';
import { Material } from '../../entities/material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductMaterial, Material])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}


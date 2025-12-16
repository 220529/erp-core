import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateProductMaterialDto, UpdateProductMaterialDto } from './dto/product-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { OperationLog } from '../../common/decorators/operation-log.decorator';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '创建产品套餐' })
  @RequirePermission('product:create')
  @OperationLog({ action: '创建套餐', module: 'product' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: '查询产品套餐列表' })
  @RequirePermission('product:list')
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询产品套餐详情' })
  @RequirePermission('product:list')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新产品套餐' })
  @RequirePermission('product:update')
  @OperationLog({ action: '更新套餐', module: 'product' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除产品套餐' })
  @RequirePermission('product:delete')
  @OperationLog({ action: '删除套餐', module: 'product' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.remove(id);
    return { message: '删除成功' };
  }

  // ==================== 产品物料管理 ====================

  @Get(':id/materials')
  @ApiOperation({ summary: '获取产品的物料清单' })
  @RequirePermission('product:list')
  getProductMaterials(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductMaterials(id);
  }

  @Post(':id/materials')
  @ApiOperation({ summary: '为产品添加物料' })
  @RequirePermission('product:update')
  addProductMaterial(@Body() createDto: CreateProductMaterialDto) {
    return this.productsService.addProductMaterial(createDto);
  }

  @Put('materials/:id')
  @ApiOperation({ summary: '更新产品物料' })
  @RequirePermission('product:update')
  updateProductMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductMaterialDto,
  ) {
    return this.productsService.updateProductMaterial(id, updateDto);
  }

  @Delete('materials/:id')
  @ApiOperation({ summary: '删除产品物料' })
  @RequirePermission('product:update')
  async removeProductMaterial(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.removeProductMaterial(id);
    return { message: '删除成功' };
  }
}


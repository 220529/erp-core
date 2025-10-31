import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductMaterial } from '../../entities/product-material.entity';
import { Material } from '../../entities/material.entity';
import { ProductStatus } from '../../common/constants';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateProductMaterialDto, UpdateProductMaterialDto } from './dto/product-material.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductMaterial)
    private readonly productMaterialRepository: Repository<ProductMaterial>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const code = await this.generateProductCode();
    
    const product = this.productRepository.create({
      ...createProductDto,
      code,
      status: createProductDto.status || ProductStatus.ACTIVE,
      costPrice: createProductDto.costPrice || 0,
      salePrice: createProductDto.salePrice || 0,
      sort: createProductDto.sort || 0,
    });
    
    return await this.productRepository.save(product);
  }
  
  /**
   * 生成产品编码
   * 规则：CP + YYYYMMDD + 4位随机数
   * 示例：CP202510310001（产品套餐）
   */
  private async generateProductCode(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CP${dateStr}${random}`;
  }

  async findAll(query: QueryProductDto) {
    const { keyword, status, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (keyword) {
      queryBuilder.where(
        'product.name LIKE :keyword OR product.code LIKE :keyword OR product.description LIKE :keyword',
        { keyword: `%${keyword}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('product.sort', 'DESC')
      .addOrderBy('product.createdAt', 'DESC');

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`产品 #${id} 不存在`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  // ==================== 产品物料管理 ====================

  /**
   * 获取产品的物料清单
   */
  async getProductMaterials(productId: number) {
    const product = await this.findOne(productId);
    
    const materials = await this.productMaterialRepository
      .createQueryBuilder('pm')
      .leftJoinAndSelect('pm.material', 'material')
      .where('pm.productId = :productId', { productId })
      .orderBy('pm.createdAt', 'ASC')
      .getMany();

    // 计算总成本和总售价
    const totalCost = materials.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.price || 0));
    }, 0);

    return {
      product: {
        id: product.id,
        name: product.name,
        code: product.code,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
      },
      materials: materials.map(item => ({
        id: item.id,
        materialId: item.materialId,
        materialName: item.materialName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        amount: item.amount,
        remark: item.remark,
        material: item.material,
      })),
      summary: {
        totalCost,
        materialCount: materials.length,
      },
    };
  }

  /**
   * 添加产品物料
   */
  async addProductMaterial(createDto: CreateProductMaterialDto): Promise<ProductMaterial> {
    // 验证产品存在
    await this.findOne(createDto.productId);

    // 验证物料存在
    const material = await this.materialRepository.findOne({
      where: { id: createDto.materialId },
    });
    if (!material) {
      throw new NotFoundException(`物料 #${createDto.materialId} 不存在`);
    }

    // 检查是否已存在
    const existing = await this.productMaterialRepository.findOne({
      where: {
        productId: createDto.productId,
        materialId: createDto.materialId,
      },
    });
    if (existing) {
      throw new BadRequestException('该物料已在产品清单中');
    }

    // 创建产品物料关联
    const productMaterial = this.productMaterialRepository.create({
      productId: createDto.productId,
      materialId: createDto.materialId,
      materialName: material.name,
      category: material.category,
      quantity: createDto.quantity,
      unit: createDto.unit || material.unit || '个',
      price: createDto.price ?? 0,
      amount: Number(createDto.quantity) * Number(createDto.price ?? 0),
      remark: createDto.remark,
    });

    return await this.productMaterialRepository.save(productMaterial);
  }

  /**
   * 更新产品物料
   */
  async updateProductMaterial(
    id: number,
    updateDto: UpdateProductMaterialDto,
  ): Promise<ProductMaterial> {
    const productMaterial = await this.productMaterialRepository.findOne({
      where: { id },
    });
    if (!productMaterial) {
      throw new NotFoundException(`产品物料 #${id} 不存在`);
    }

    // 更新字段
    if (updateDto.quantity !== undefined) {
      productMaterial.quantity = updateDto.quantity;
    }
    if (updateDto.unit !== undefined) {
      productMaterial.unit = updateDto.unit;
    }
    if (updateDto.price !== undefined) {
      productMaterial.price = updateDto.price;
    }
    if (updateDto.remark !== undefined) {
      productMaterial.remark = updateDto.remark;
    }

    // 重新计算金额
    productMaterial.amount = Number(productMaterial.quantity) * Number(productMaterial.price ?? 0);

    return await this.productMaterialRepository.save(productMaterial);
  }

  /**
   * 删除产品物料
   */
  async removeProductMaterial(id: number): Promise<void> {
    const productMaterial = await this.productMaterialRepository.findOne({
      where: { id },
    });
    if (!productMaterial) {
      throw new NotFoundException(`产品物料 #${id} 不存在`);
    }

    await this.productMaterialRepository.remove(productMaterial);
  }
}


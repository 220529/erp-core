import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '../../entities/material.entity';
import { MaterialCategory } from '../../common/constants';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    const code = await this.generateMaterialCode();
    
    const material = this.materialRepository.create({
      ...createMaterialDto,
      code,
      category: (createMaterialDto.category as MaterialCategory) || MaterialCategory.MAIN,
    });
    
    return await this.materialRepository.save(material);
  }
  
  private async generateMaterialCode(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MAT${dateStr}${random}`;
  }

  async findAll(query: QueryMaterialDto) {
    const { keyword, category, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.materialRepository.createQueryBuilder('material');

    if (keyword) {
      queryBuilder.where(
        'material.name LIKE :keyword OR material.brand LIKE :keyword OR material.spec LIKE :keyword',
        { keyword: `%${keyword}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('material.category = :category', { category });
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('material.createdAt', 'DESC');

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<Material> {
    const material = await this.materialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`物料 #${id} 不存在`);
    }

    return material;
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto): Promise<Material> {
    const material = await this.findOne(id);
    Object.assign(material, updateMaterialDto);
    return await this.materialRepository.save(material);
  }

  async remove(id: number): Promise<void> {
    const material = await this.findOne(id);
    await this.materialRepository.remove(material);
  }
}


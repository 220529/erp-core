import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DictType } from '../../entities/dict-type.entity';
import { DictData } from '../../entities/dict-data.entity';
import {
  CreateDictTypeDto,
  UpdateDictTypeDto,
  QueryDictTypeDto,
} from './dto/dict-type.dto';
import {
  CreateDictDataDto,
  UpdateDictDataDto,
  QueryDictDataDto,
} from './dto/dict-data.dto';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(DictType)
    private dictTypeRepository: Repository<DictType>,
    @InjectRepository(DictData)
    private dictDataRepository: Repository<DictData>,
  ) {}

  // ==================== 字典类型管理 ====================

  /**
   * 创建字典类型
   */
  async createType(createDto: CreateDictTypeDto): Promise<DictType> {
    // 检查编码是否已存在
    const existing = await this.dictTypeRepository.findOne({
      where: { code: createDto.code },
    });
    if (existing) {
      throw new ConflictException(`字典类型编码 ${createDto.code} 已存在`);
    }

    const dictType = this.dictTypeRepository.create(createDto);
    return await this.dictTypeRepository.save(dictType);
  }

  /**
   * 查询字典类型列表
   */
  async findTypes(query: QueryDictTypeDto) {
    const { page = 1, pageSize = 20, name, code, status } = query;

    const queryBuilder = this.dictTypeRepository.createQueryBuilder('type');

    if (name) {
      queryBuilder.andWhere('type.name LIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('type.code LIKE :code', { code: `%${code}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('type.status = :status', { status });
    }

    queryBuilder.orderBy('type.sort', 'ASC').addOrderBy('type.createdAt', 'DESC');

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取所有启用的字典类型（不分页）
   */
  async findAllEnabledTypes(): Promise<DictType[]> {
    return await this.dictTypeRepository.find({
      where: { status: 1 },
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取字典类型详情
   */
  async findTypeById(id: number): Promise<DictType> {
    const dictType = await this.dictTypeRepository.findOne({ where: { id } });
    if (!dictType) {
      throw new NotFoundException(`字典类型 ID ${id} 不存在`);
    }
    return dictType;
  }

  /**
   * 通过编码获取字典类型
   */
  async findTypeByCode(code: string): Promise<DictType> {
    const dictType = await this.dictTypeRepository.findOne({ where: { code } });
    if (!dictType) {
      throw new NotFoundException(`字典类型编码 ${code} 不存在`);
    }
    return dictType;
  }

  /**
   * 更新字典类型
   */
  async updateType(id: number, updateDto: UpdateDictTypeDto): Promise<DictType> {
    const dictType = await this.findTypeById(id);
    Object.assign(dictType, updateDto);
    return await this.dictTypeRepository.save(dictType);
  }

  /**
   * 删除字典类型
   */
  async removeType(id: number): Promise<void> {
    const dictType = await this.findTypeById(id);

    // 检查是否有关联的字典数据
    const dataCount = await this.dictDataRepository.count({
      where: { typeCode: dictType.code },
    });

    if (dataCount > 0) {
      throw new ConflictException(
        `该字典类型下还有 ${dataCount} 条字典数据，无法删除`,
      );
    }

    await this.dictTypeRepository.remove(dictType);
  }

  // ==================== 字典数据管理 ====================

  /**
   * 创建字典数据
   */
  async createData(createDto: CreateDictDataDto): Promise<DictData> {
    // 验证字典类型是否存在
    await this.findTypeByCode(createDto.typeCode);

    const dictData = this.dictDataRepository.create(createDto);
    return await this.dictDataRepository.save(dictData);
  }

  /**
   * 查询字典数据列表
   */
  async findData(query: QueryDictDataDto) {
    const { page = 1, pageSize = 20, typeCode, label, status } = query;

    const queryBuilder = this.dictDataRepository.createQueryBuilder('data');

    if (typeCode) {
      queryBuilder.andWhere('data.typeCode = :typeCode', { typeCode });
    }

    if (label) {
      queryBuilder.andWhere('data.label LIKE :label', { label: `%${label}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('data.status = :status', { status });
    }

    queryBuilder.orderBy('data.sort', 'ASC').addOrderBy('data.createdAt', 'DESC');

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 根据字典类型编码获取所有启用的字典数据
   */
  async findDataByTypeCode(typeCode: string): Promise<DictData[]> {
    return await this.dictDataRepository.find({
      where: { typeCode, status: 1 },
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取字典数据详情
   */
  async findDataById(id: number): Promise<DictData> {
    const dictData = await this.dictDataRepository.findOne({ where: { id } });
    if (!dictData) {
      throw new NotFoundException(`字典数据 ID ${id} 不存在`);
    }
    return dictData;
  }

  /**
   * 更新字典数据
   */
  async updateData(id: number, updateDto: UpdateDictDataDto): Promise<DictData> {
    const dictData = await this.findDataById(id);
    Object.assign(dictData, updateDto);
    return await this.dictDataRepository.save(dictData);
  }

  /**
   * 删除字典数据
   */
  async removeData(id: number): Promise<void> {
    const dictData = await this.findDataById(id);
    await this.dictDataRepository.remove(dictData);
  }
}


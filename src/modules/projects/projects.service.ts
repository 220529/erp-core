import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { ProjectStatus } from '../../common/constants';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const projectNo = await this.generateProjectNo();
    
    const project = this.projectRepository.create({
      ...createProjectDto,
      projectNo,
      status: ProjectStatus.PLANNING,
    });
    
    return await this.projectRepository.save(project);
  }

  async findAll(query: QueryProjectDto) {
    const { keyword, status, orderId, foremanId, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.order', 'order')
      .leftJoinAndSelect('project.customer', 'customer');

    if (keyword) {
      queryBuilder.where(
        'project.projectNo LIKE :keyword OR project.name LIKE :keyword',
        { keyword: `%${keyword}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    if (orderId) {
      queryBuilder.andWhere('project.orderId = :orderId', { orderId });
    }

    if (foremanId) {
      queryBuilder.andWhere('project.foremanId = :foremanId', { foremanId });
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('project.createdAt', 'DESC');

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['order', 'customer'],
    });

    if (!project) {
      throw new NotFoundException(`项目 #${id} 不存在`);
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }

  private async generateProjectNo(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PRJ${dateStr}${random}`;
  }
}


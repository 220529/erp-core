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
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('materials')
@Controller('materials')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: '创建物料' })
  @RequirePermission('material:create')
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @Get()
  @ApiOperation({ summary: '查询物料列表' })
  @RequirePermission('material:list')
  findAll(@Query() query: QueryMaterialDto) {
    return this.materialsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询物料详情' })
  @RequirePermission('material:list')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新物料' })
  @RequirePermission('material:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除物料' })
  @RequirePermission('material:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.materialsService.remove(id);
    return { message: '删除成功' };
  }
}


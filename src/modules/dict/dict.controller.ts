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
import { DictService } from './dict.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

@ApiTags('dict')
@Controller('dict')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DictController {
  constructor(private readonly dictService: DictService) {}

  // ==================== 字典类型管理 ====================

  @Post('type')
  @ApiOperation({ summary: '创建字典类型' })
  async createType(@Body() createDto: CreateDictTypeDto) {
    return await this.dictService.createType(createDto);
  }

  @Get('type')
  @ApiOperation({ summary: '查询字典类型列表' })
  async findTypes(@Query() query: QueryDictTypeDto) {
    return await this.dictService.findTypes(query);
  }

  @Get('type/all')
  @ApiOperation({ summary: '获取所有启用的字典类型（不分页）' })
  async findAllEnabledTypes() {
    return await this.dictService.findAllEnabledTypes();
  }

  @Get('type/:id')
  @ApiOperation({ summary: '获取字典类型详情' })
  async findTypeById(@Param('id', ParseIntPipe) id: number) {
    return await this.dictService.findTypeById(id);
  }

  @Put('type/:id')
  @ApiOperation({ summary: '更新字典类型' })
  async updateType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDictTypeDto,
  ) {
    return await this.dictService.updateType(id, updateDto);
  }

  @Delete('type/:id')
  @ApiOperation({ summary: '删除字典类型' })
  async removeType(@Param('id', ParseIntPipe) id: number) {
    await this.dictService.removeType(id);
    return { message: '删除成功' };
  }

  // ==================== 字典数据管理 ====================

  @Post('data')
  @ApiOperation({ summary: '创建字典数据' })
  async createData(@Body() createDto: CreateDictDataDto) {
    return await this.dictService.createData(createDto);
  }

  @Get('data')
  @ApiOperation({ summary: '查询字典数据列表' })
  async findData(@Query() query: QueryDictDataDto) {
    return await this.dictService.findData(query);
  }

  @Get('data/type/:typeCode')
  @ApiOperation({ summary: '根据字典类型编码获取所有启用的字典数据' })
  async findDataByTypeCode(@Param('typeCode') typeCode: string) {
    return await this.dictService.findDataByTypeCode(typeCode);
  }

  @Get('data/:id')
  @ApiOperation({ summary: '获取字典数据详情' })
  async findDataById(@Param('id', ParseIntPipe) id: number) {
    return await this.dictService.findDataById(id);
  }

  @Put('data/:id')
  @ApiOperation({ summary: '更新字典数据' })
  async updateData(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDictDataDto,
  ) {
    return await this.dictService.updateData(id, updateDto);
  }

  @Delete('data/:id')
  @ApiOperation({ summary: '删除字典数据' })
  async removeData(@Param('id', ParseIntPipe) id: number) {
    await this.dictService.removeData(id);
    return { message: '删除成功' };
  }
}


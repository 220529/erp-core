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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CompanyService } from './company.service';

@ApiTags('公司管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: '公司列表' })
  @RequirePermission('system:company:list')
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('name') name?: string,
    @Query('status') status?: number,
  ) {
    return this.companyService.findAll({ page, pageSize, name, status });
  }

  @Get('simple')
  @ApiOperation({ summary: '公司下拉列表' })
  findAllSimple() {
    return this.companyService.findAllSimple();
  }

  @Get(':id')
  @ApiOperation({ summary: '公司详情' })
  @RequirePermission('system:company:list')
  findOne(@Param('id') id: number) {
    return this.companyService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建公司' })
  @RequirePermission('system:company:create')
  create(@Body() data: any) {
    return this.companyService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新公司' })
  @RequirePermission('system:company:update')
  update(@Param('id') id: number, @Body() data: any) {
    return this.companyService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除公司' })
  @RequirePermission('system:company:delete')
  remove(@Param('id') id: number) {
    return this.companyService.remove(id);
  }
}

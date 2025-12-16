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
import { DepartmentService } from './department.service';

@ApiTags('部门管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @ApiOperation({ summary: '部门列表' })
  @RequirePermission('system:department:list')
  findAll(@Query('companyId') companyId?: number) {
    return this.departmentService.findAll(companyId);
  }

  @Get('tree')
  @ApiOperation({ summary: '部门树' })
  findTree(@Query('companyId') companyId: number) {
    return this.departmentService.findTree(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: '部门详情' })
  @RequirePermission('system:department:list')
  findOne(@Param('id') id: number) {
    return this.departmentService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建部门' })
  @RequirePermission('system:department:create')
  create(@Body() data: any) {
    return this.departmentService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新部门' })
  @RequirePermission('system:department:update')
  update(@Param('id') id: number, @Body() data: any) {
    return this.departmentService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  @RequirePermission('system:department:delete')
  remove(@Param('id') id: number) {
    return this.departmentService.remove(id);
  }
}

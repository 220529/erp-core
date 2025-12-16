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
import { RoleService } from './role.service';

@ApiTags('角色管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: '角色列表' })
  @RequirePermission('system:role:list')
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: number,
  ) {
    return this.roleService.findAll({ page, pageSize, status });
  }

  @Get('simple')
  @ApiOperation({ summary: '角色下拉列表' })
  findAllSimple() {
    return this.roleService.findAllSimple();
  }

  @Get('menus')
  @ApiOperation({ summary: '获取菜单树（用于权限分配）' })
  @RequirePermission('system:role:list')
  getMenuTree() {
    return this.roleService.getMenuTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '角色详情' })
  @RequirePermission('system:role:list')
  findOne(@Param('id') id: number) {
    return this.roleService.findOne(id);
  }

  @Get(':key/menus')
  @ApiOperation({ summary: '获取角色的菜单权限' })
  @RequirePermission('system:role:list')
  getRoleMenus(@Param('key') key: string) {
    return this.roleService.getRoleMenus(key);
  }

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @RequirePermission('system:role:create')
  create(@Body() data: any) {
    return this.roleService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  @RequirePermission('system:role:update')
  update(@Param('id') id: number, @Body() data: any) {
    return this.roleService.update(id, data);
  }

  @Put(':key/menus')
  @ApiOperation({ summary: '分配角色权限' })
  @RequirePermission('system:role:update')
  assignMenus(@Param('key') key: string, @Body('menuIds') menuIds: number[]) {
    return this.roleService.assignMenus(key, menuIds);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @RequirePermission('system:role:delete')
  remove(@Param('id') id: number) {
    return this.roleService.remove(id);
  }
}

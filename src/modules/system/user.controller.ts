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
import { UserService } from './user.service';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '用户列表' })
  @RequirePermission('system:user:list')
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('keyword') keyword?: string,
    @Query('companyId') companyId?: number,
    @Query('departmentId') departmentId?: number,
    @Query('role') role?: string,
    @Query('status') status?: number,
  ) {
    return this.userService.findAll({
      page,
      pageSize,
      keyword,
      companyId,
      departmentId,
      role,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '用户详情' })
  @RequirePermission('system:user:list')
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @RequirePermission('system:user:create')
  create(@Body() data: any) {
    return this.userService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  @RequirePermission('system:user:update')
  update(@Param('id') id: number, @Body() data: any) {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @RequirePermission('system:user:delete')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '修改用户状态' })
  @RequirePermission('system:user:update')
  updateStatus(@Param('id') id: number, @Body('status') status: number) {
    return this.userService.updateStatus(id, status);
  }

  @Put(':id/reset-password')
  @ApiOperation({ summary: '重置密码' })
  @RequirePermission('system:user:update')
  resetPassword(@Param('id') id: number, @Body('password') password: string) {
    return this.userService.resetPassword(id, password);
  }
}

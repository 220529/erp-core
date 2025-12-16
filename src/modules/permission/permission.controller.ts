import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionService } from './permission.service';

@ApiTags('permission')
@Controller('permission')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('menus')
  @ApiOperation({ summary: '获取当前用户的菜单树' })
  async getUserMenus(@Request() req) {
    return this.permissionService.getUserMenus(req.user.role);
  }

  @Get('permissions')
  @ApiOperation({ summary: '获取当前用户的权限列表' })
  async getUserPermissions(@Request() req) {
    return this.permissionService.getUserPermissions(req.user.role);
  }
}

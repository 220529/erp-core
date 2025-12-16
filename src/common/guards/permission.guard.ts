import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { PermissionService } from '../../modules/permission/permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取接口需要的权限
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有设置权限要求，直接放行
    if (!requiredPermission) {
      return true;
    }

    // 获取当前用户
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    // admin 直接放行
    if (user.role === 'admin') {
      return true;
    }

    // 检查用户是否有该权限
    const hasPermission = await this.permissionService.hasPermission(
      user.role,
      requiredPermission,
    );

    if (!hasPermission) {
      throw new ForbiddenException(`没有权限：${requiredPermission}`);
    }

    return true;
  }
}

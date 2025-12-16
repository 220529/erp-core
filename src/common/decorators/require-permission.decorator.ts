import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

/**
 * 权限装饰器
 * 用于标记接口需要的权限
 * @param permission 权限标识，如 'customer:delete'
 */
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);

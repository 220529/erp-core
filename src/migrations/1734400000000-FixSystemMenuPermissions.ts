import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 修复系统管理模块的菜单和按钮权限
 * 
 * 问题：
 * 1. ID 60 是 system-user（用户管理），路径 /system/user - 错误
 * 2. ID 63 是 system-org（组织架构），路径 /system/org - 多余
 * 
 * 解决：
 * 1. 删除多余的 ID 63 菜单
 * 2. 修正 ID 60 为组织架构，路径改为 /system/org
 */
export class FixSystemMenuPermissions1734400000000 implements MigrationInterface {
  name = 'FixSystemMenuPermissions1734400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 删除多余的组织架构菜单 (ID 63) 及其关联
    await queryRunner.query(`DELETE FROM role_menus WHERE menu_id = 63`);
    await queryRunner.query(`DELETE FROM menus WHERE id = 63`);

    // 2. 修正 ID 60 菜单：从"用户管理"改为"组织架构"
    await queryRunner.query(`
      UPDATE menus SET 
        name = 'system-org',
        title = '组织架构',
        path = '/system/org',
        component = 'system/Organization',
        permission = 'system:org'
      WHERE id = 60
    `);

    // 3. 确保按钮权限正确（已存在则更新）
    await queryRunner.query(`
      INSERT INTO menus (id, name, title, parent_id, type, permission, sort, status, created_at, updated_at) VALUES
      (601, 'system-company-list', '查看公司', 60, 'button', 'system:company:list', 1, 1, NOW(), NOW()),
      (602, 'system-company-create', '新增公司', 60, 'button', 'system:company:create', 2, 1, NOW(), NOW()),
      (603, 'system-company-update', '编辑公司', 60, 'button', 'system:company:update', 3, 1, NOW(), NOW()),
      (604, 'system-company-delete', '删除公司', 60, 'button', 'system:company:delete', 4, 1, NOW(), NOW()),
      (605, 'system-department-list', '查看部门', 60, 'button', 'system:department:list', 5, 1, NOW(), NOW()),
      (606, 'system-department-create', '新增部门', 60, 'button', 'system:department:create', 6, 1, NOW(), NOW()),
      (607, 'system-department-update', '编辑部门', 60, 'button', 'system:department:update', 7, 1, NOW(), NOW()),
      (608, 'system-department-delete', '删除部门', 60, 'button', 'system:department:delete', 8, 1, NOW(), NOW()),
      (609, 'system-user-list', '查看用户', 60, 'button', 'system:user:list', 9, 1, NOW(), NOW()),
      (610, 'system-user-create', '新增用户', 60, 'button', 'system:user:create', 10, 1, NOW(), NOW()),
      (611, 'system-user-update', '编辑用户', 60, 'button', 'system:user:update', 11, 1, NOW(), NOW()),
      (612, 'system-user-delete', '删除用户', 60, 'button', 'system:user:delete', 12, 1, NOW(), NOW()),
      (613, 'system-role-list', '查看角色', 61, 'button', 'system:role:list', 1, 1, NOW(), NOW()),
      (614, 'system-role-create', '新增角色', 61, 'button', 'system:role:create', 2, 1, NOW(), NOW()),
      (615, 'system-role-update', '编辑角色', 61, 'button', 'system:role:update', 3, 1, NOW(), NOW()),
      (616, 'system-role-delete', '删除角色', 61, 'button', 'system:role:delete', 4, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        title = VALUES(title),
        parent_id = VALUES(parent_id),
        permission = VALUES(permission)
    `);

    // 4. 更新角色管理菜单的 permission
    await queryRunner.query(`UPDATE menus SET permission = 'system:role' WHERE id = 61`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚：恢复原状
    await queryRunner.query(`
      UPDATE menus SET 
        name = 'system-user',
        title = '用户管理',
        path = '/system/user',
        component = 'system/User',
        permission = 'system:org'
      WHERE id = 60
    `);
  }
}

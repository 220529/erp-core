import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 添加系统管理模块的按钮权限
 */
export class AddSystemMenuPermissions1734360000000 implements MigrationInterface {
  name = 'AddSystemMenuPermissions1734360000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // =====================================================
    // 系统管理 - 按钮权限
    // =====================================================
    await queryRunner.query(`
      INSERT INTO menus (id, name, title, parent_id, type, permission, sort, status, created_at, updated_at) VALUES
      -- 用户管理按钮 (60)
      (601, 'system-user-list', '查看用户', 60, 'button', 'system:user:list', 1, 1, NOW(), NOW()),
      (602, 'system-user-create', '新增用户', 60, 'button', 'system:user:create', 2, 1, NOW(), NOW()),
      (603, 'system-user-update', '编辑用户', 60, 'button', 'system:user:update', 3, 1, NOW(), NOW()),
      (604, 'system-user-delete', '删除用户', 60, 'button', 'system:user:delete', 4, 1, NOW(), NOW()),
      -- 角色管理按钮 (61)
      (611, 'system-role-list', '查看角色', 61, 'button', 'system:role:list', 1, 1, NOW(), NOW()),
      (612, 'system-role-create', '新增角色', 61, 'button', 'system:role:create', 2, 1, NOW(), NOW()),
      (613, 'system-role-update', '编辑角色', 61, 'button', 'system:role:update', 3, 1, NOW(), NOW()),
      (614, 'system-role-delete', '删除角色', 61, 'button', 'system:role:delete', 4, 1, NOW(), NOW()),
      -- 菜单管理按钮 (62)
      (621, 'system-menu-list', '查看菜单', 62, 'button', 'system:menu:list', 1, 1, NOW(), NOW()),
      (622, 'system-menu-create', '新增菜单', 62, 'button', 'system:menu:create', 2, 1, NOW(), NOW()),
      (623, 'system-menu-update', '编辑菜单', 62, 'button', 'system:menu:update', 3, 1, NOW(), NOW()),
      (624, 'system-menu-delete', '删除菜单', 62, 'button', 'system:menu:delete', 4, 1, NOW(), NOW()),
      -- 组织架构按钮 (63) - 公司和部门
      (631, 'system-company-list', '查看公司', 63, 'button', 'system:company:list', 1, 1, NOW(), NOW()),
      (632, 'system-company-create', '新增公司', 63, 'button', 'system:company:create', 2, 1, NOW(), NOW()),
      (633, 'system-company-update', '编辑公司', 63, 'button', 'system:company:update', 3, 1, NOW(), NOW()),
      (634, 'system-company-delete', '删除公司', 63, 'button', 'system:company:delete', 4, 1, NOW(), NOW()),
      (635, 'system-department-list', '查看部门', 63, 'button', 'system:department:list', 5, 1, NOW(), NOW()),
      (636, 'system-department-create', '新增部门', 63, 'button', 'system:department:create', 6, 1, NOW(), NOW()),
      (637, 'system-department-update', '编辑部门', 63, 'button', 'system:department:update', 7, 1, NOW(), NOW()),
      (638, 'system-department-delete', '删除部门', 63, 'button', 'system:department:delete', 8, 1, NOW(), NOW()),
      -- 操作日志按钮 (64)
      (641, 'system-log-list', '查看日志', 64, 'button', 'system:log:list', 1, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    // 更新系统管理菜单的 permission 字段
    await queryRunner.query(`
      UPDATE menus SET permission = 'system:user:list' WHERE id = 60;
    `);
    await queryRunner.query(`
      UPDATE menus SET permission = 'system:role:list' WHERE id = 61;
    `);
    await queryRunner.query(`
      UPDATE menus SET permission = 'system:menu:list' WHERE id = 62;
    `);
    await queryRunner.query(`
      UPDATE menus SET permission = 'system:org:list' WHERE id = 63;
    `);
    await queryRunner.query(`
      UPDATE menus SET permission = 'system:log:list' WHERE id = 64;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM menus WHERE id >= 601 AND id <= 641`);
    await queryRunner.query(`UPDATE menus SET permission = NULL WHERE id IN (60, 61, 62, 63, 64)`);
  }
}

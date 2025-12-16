import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 简化菜单结构
 * 
 * 调整：
 * 1. 单子菜单的一级菜单改为直接可点击（删除二级菜单，一级菜单直接有 path）
 * 2. 系统管理保留二级结构（组织架构、角色管理、系统功能、定时任务）
 * 3. 基础数据保留二级结构（字典管理、代码流程、文件管理）
 * 4. 调整设计师权限：产品和材料只能查看
 * 
 * 新菜单结构：
 * - 客户管理 /customer (ID:1)
 * - 订单管理 /order (ID:2)
 * - 材料管理 /material (ID:3)
 * - 产品管理 /product (ID:4)
 * - 收款管理 /finance (ID:5)
 * - 基础数据 (ID:7) - 仅超管可见
 *   - 字典管理 /data/dict (ID:70)
 *   - 代码流程 /data/codeflow (ID:71)
 *   - 文件管理 /data/file (ID:72)
 * - 系统管理 (ID:6) - 仅超管可见
 *   - 组织架构 /system/org (ID:60)
 *   - 角色管理 /system/role (ID:61)
 *   - 系统功能 /system/feature (ID:62)
 *   - 定时任务 /system/scheduler (ID:63)
 */
export class SimplifyMenuStructure1734420000000 implements MigrationInterface {
  name = 'SimplifyMenuStructure1734420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 删除旧的二级菜单（ID 10-50）及其按钮权限的角色关联
    await queryRunner.query(`DELETE FROM role_menus WHERE menu_id IN (10, 20, 30, 40, 50)`);
    
    // 2. 更新按钮权限的 parent_id 指向一级菜单
    await queryRunner.query(`UPDATE menus SET parent_id = 1 WHERE parent_id = 10`); // 客户按钮
    await queryRunner.query(`UPDATE menus SET parent_id = 2 WHERE parent_id = 20`); // 订单按钮
    await queryRunner.query(`UPDATE menus SET parent_id = 3 WHERE parent_id = 30`); // 材料按钮
    await queryRunner.query(`UPDATE menus SET parent_id = 4 WHERE parent_id = 40`); // 产品按钮
    await queryRunner.query(`UPDATE menus SET parent_id = 5 WHERE parent_id = 50`); // 收款按钮

    // 3. 删除旧的二级菜单
    await queryRunner.query(`DELETE FROM menus WHERE id IN (10, 20, 30, 40, 50)`);

    // 4. 更新一级菜单，添加 path 和 permission
    await queryRunner.query(`UPDATE menus SET path = '/customer', permission = 'customer:list', component = 'customer/List' WHERE id = 1`);
    await queryRunner.query(`UPDATE menus SET path = '/order', permission = 'order:list', component = 'order/List' WHERE id = 2`);
    await queryRunner.query(`UPDATE menus SET path = '/material', permission = 'material:list', component = 'material/List' WHERE id = 3`);
    await queryRunner.query(`UPDATE menus SET path = '/product', permission = 'product:list', component = 'product/List' WHERE id = 4`);
    await queryRunner.query(`UPDATE menus SET path = '/finance', permission = 'payment:list', component = 'finance/List' WHERE id = 5`);

    // 5. 添加基础数据一级菜单
    await queryRunner.query(`
      INSERT INTO menus (id, name, title, icon, path, type, sort, status, created_at, updated_at) VALUES
      (7, 'data', '基础数据', 'SettingOutlined', '/data', 'menu', 90, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    // 6. 添加基础数据二级菜单（带图标）
    await queryRunner.query(`
      INSERT INTO menus (id, name, title, icon, path, component, parent_id, type, permission, sort, status, created_at, updated_at) VALUES
      (70, 'data-dict', '字典管理', 'BookOutlined', '/data/dict', 'dict/List', 7, 'menu', 'data:dict', 1, 1, NOW(), NOW()),
      (71, 'data-codeflow', '代码流程', 'CodeOutlined', '/data/codeflow', 'codeflow/List', 7, 'menu', 'data:codeflow', 2, 1, NOW(), NOW()),
      (72, 'data-file', '文件管理', 'FolderOutlined', '/data/file', 'file/List', 7, 'menu', 'data:file', 3, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    // 7. 添加系统管理额外的二级菜单（带图标）
    await queryRunner.query(`
      INSERT INTO menus (id, name, title, icon, path, component, parent_id, type, permission, sort, status, created_at, updated_at) VALUES
      (62, 'system-feature', '系统功能', 'KeyOutlined', '/system/feature', 'system/Feature', 6, 'menu', 'system:feature', 3, 1, NOW(), NOW()),
      (63, 'system-scheduler', '定时任务', 'ClockCircleOutlined', '/system/scheduler', 'scheduler/List', 6, 'menu', 'system:scheduler', 4, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    // 8. 更新已有的系统管理二级菜单图标
    await queryRunner.query(`UPDATE menus SET icon = 'ApartmentOutlined' WHERE id = 60`); // 组织架构
    await queryRunner.query(`UPDATE menus SET icon = 'SafetyOutlined' WHERE id = 61`); // 角色管理

    // 9. 清空所有角色权限，重新分配
    await queryRunner.query(`DELETE FROM role_menus WHERE role IN ('designer', 'foreman', 'finance')`);

    // 10. 设计师权限：客户(增删改查)、订单(增改查)、产品(查看)、材料(查看)
    await queryRunner.query(`
      INSERT INTO role_menus (role, menu_id, created_at, updated_at) VALUES
      ('designer', 1, NOW(), NOW()),
      ('designer', 101, NOW(), NOW()),
      ('designer', 102, NOW(), NOW()),
      ('designer', 103, NOW(), NOW()),
      ('designer', 2, NOW(), NOW()),
      ('designer', 201, NOW(), NOW()),
      ('designer', 202, NOW(), NOW()),
      ('designer', 3, NOW(), NOW()),
      ('designer', 4, NOW(), NOW())
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `);

    // 11. 工长权限：订单(查看)
    await queryRunner.query(`
      INSERT INTO role_menus (role, menu_id, created_at, updated_at) VALUES
      ('foreman', 2, NOW(), NOW())
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `);

    // 12. 财务权限：订单(查看)、收款(增删改查)
    await queryRunner.query(`
      INSERT INTO role_menus (role, menu_id, created_at, updated_at) VALUES
      ('finance', 2, NOW(), NOW()),
      ('finance', 5, NOW(), NOW()),
      ('finance', 501, NOW(), NOW()),
      ('finance', 502, NOW(), NOW()),
      ('finance', 503, NOW(), NOW())
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除新增的菜单
    await queryRunner.query(`DELETE FROM menus WHERE id IN (7, 70, 71, 72, 62, 63)`);
    // 恢复二级菜单结构（简化回滚，实际可能需要更完整的恢复）
    await queryRunner.query(`UPDATE menus SET path = NULL, permission = NULL, component = NULL WHERE id IN (1, 2, 3, 4, 5)`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 初始化菜单和角色权限数据
 * 这是系统的基础数据，首次部署时执行
 */
export class InitMenusAndRoles1734350000000 implements MigrationInterface {
  name = 'InitMenusAndRoles1734350000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // =====================================================
    // 一级菜单
    // =====================================================
    await queryRunner.query(`
      INSERT INTO menus (id, name, title, icon, path, type, sort, status, created_at, updated_at) VALUES
      (1, 'customer', '客户管理', 'UserOutlined', '/customer', 'menu', 1, 1, NOW(), NOW()),
      (2, 'order', '订单管理', 'FileTextOutlined', '/order', 'menu', 2, 1, NOW(), NOW()),
      (3, 'material', '材料管理', 'AppstoreOutlined', '/material', 'menu', 3, 1, NOW(), NOW()),
      (4, 'product', '产品管理', 'ShopOutlined', '/product', 'menu', 4, 1, NOW(), NOW()),
      (5, 'payment', '收款管理', 'PayCircleOutlined', '/payment', 'menu', 5, 1, NOW(), NOW()),
      (6, 'system', '系统管理', 'SettingOutlined', '/system', 'menu', 99, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    // =====================================================
    // 二级菜单（路径需与前端路由一致）
    // =====================================================
    await queryRunner.query(`
      INSERT INTO menus (id, name, title, path, component, parent_id, type, permission, sort, status, created_at, updated_at) VALUES
      (10, 'customer-list', '客户列表', '/customer', 'customer/List', 1, 'menu', 'customer:list', 1, 1, NOW(), NOW()),
      (20, 'order-list', '订单列表', '/order', 'order/List', 2, 'menu', 'order:list', 1, 1, NOW(), NOW()),
      (30, 'material-list', '材料列表', '/material', 'material/List', 3, 'menu', 'material:list', 1, 1, NOW(), NOW()),
      (40, 'product-list', '产品列表', '/product', 'product/List', 4, 'menu', 'product:list', 1, 1, NOW(), NOW()),
      (50, 'payment-list', '收款列表', '/finance', 'finance/List', 5, 'menu', 'payment:list', 1, 1, NOW(), NOW()),
      (60, 'system-org', '组织架构', '/system/org', 'system/Org', 6, 'menu', 'system:org', 1, 1, NOW(), NOW()),
      (61, 'system-role', '角色管理', '/system/role', 'system/Role', 6, 'menu', 'system:role', 2, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    // =====================================================
    // 按钮权限
    // =====================================================
    await queryRunner.query(`
      INSERT INTO menus (id, name, title, parent_id, type, permission, sort, status, created_at, updated_at) VALUES
      (101, 'customer-create', '新增客户', 10, 'button', 'customer:create', 1, 1, NOW(), NOW()),
      (102, 'customer-update', '编辑客户', 10, 'button', 'customer:update', 2, 1, NOW(), NOW()),
      (103, 'customer-delete', '删除客户', 10, 'button', 'customer:delete', 3, 1, NOW(), NOW()),
      (104, 'customer-export', '导出客户', 10, 'button', 'customer:export', 4, 1, NOW(), NOW()),
      (201, 'order-create', '新增订单', 20, 'button', 'order:create', 1, 1, NOW(), NOW()),
      (202, 'order-update', '编辑订单', 20, 'button', 'order:update', 2, 1, NOW(), NOW()),
      (203, 'order-delete', '删除订单', 20, 'button', 'order:delete', 3, 1, NOW(), NOW()),
      (301, 'material-create', '新增材料', 30, 'button', 'material:create', 1, 1, NOW(), NOW()),
      (302, 'material-update', '编辑材料', 30, 'button', 'material:update', 2, 1, NOW(), NOW()),
      (303, 'material-delete', '删除材料', 30, 'button', 'material:delete', 3, 1, NOW(), NOW()),
      (401, 'product-create', '新增产品', 40, 'button', 'product:create', 1, 1, NOW(), NOW()),
      (402, 'product-update', '编辑产品', 40, 'button', 'product:update', 2, 1, NOW(), NOW()),
      (403, 'product-delete', '删除产品', 40, 'button', 'product:delete', 3, 1, NOW(), NOW()),
      (501, 'payment-create', '新增收款', 50, 'button', 'payment:create', 1, 1, NOW(), NOW()),
      (502, 'payment-confirm', '确认收款', 50, 'button', 'payment:confirm', 2, 1, NOW(), NOW()),
      (503, 'payment-delete', '删除收款', 50, 'button', 'payment:delete', 3, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    // =====================================================
    // 初始化角色
    // =====================================================
    await queryRunner.query(`
      INSERT INTO roles (id, \`key\`, name, description, sort, status, created_at, updated_at) VALUES
      (1, 'admin', '系统管理员', '拥有所有权限', 1, 1, NOW(), NOW()),
      (2, 'sales', '销售', '客户管理、订单管理', 2, 1, NOW(), NOW()),
      (3, 'designer', '设计师', '客户查看、产品方案', 3, 1, NOW(), NOW()),
      (4, 'foreman', '工长', '订单查看、施工相关', 4, 1, NOW(), NOW()),
      (5, 'finance', '财务', '收款管理、报表', 5, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name) 
    `);

    // =====================================================
    // 初始化角色权限（销售）- 客户管理、订单管理
    // =====================================================
    await queryRunner.query(`
      INSERT INTO role_menus (role, menu_id, created_at, updated_at) VALUES
      ('sales', 1, NOW(), NOW()),
      ('sales', 10, NOW(), NOW()),
      ('sales', 101, NOW(), NOW()),
      ('sales', 102, NOW(), NOW()),
      ('sales', 2, NOW(), NOW()),
      ('sales', 20, NOW(), NOW()),
      ('sales', 201, NOW(), NOW()),
      ('sales', 202, NOW(), NOW())
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `);

    // =====================================================
    // 初始化角色权限（设计师）
    // =====================================================
    await queryRunner.query(`
      INSERT INTO role_menus (role, menu_id, created_at, updated_at) VALUES
      ('designer', 1, NOW(), NOW()),
      ('designer', 10, NOW(), NOW()),
      ('designer', 4, NOW(), NOW()),
      ('designer', 40, NOW(), NOW()),
      ('designer', 401, NOW(), NOW()),
      ('designer', 402, NOW(), NOW())
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `);

    // =====================================================
    // 初始化角色权限（财务）
    // =====================================================
    await queryRunner.query(`
      INSERT INTO role_menus (role, menu_id, created_at, updated_at) VALUES
      ('finance', 5, NOW(), NOW()),
      ('finance', 50, NOW(), NOW()),
      ('finance', 501, NOW(), NOW()),
      ('finance', 502, NOW(), NOW()),
      ('finance', 2, NOW(), NOW()),
      ('finance', 20, NOW(), NOW())
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚时清空数据（谨慎使用）
    await queryRunner.query(`DELETE FROM role_menus WHERE role IN ('sales', 'designer', 'finance')`);
    await queryRunner.query(`DELETE FROM roles WHERE id <= 5`);
    await queryRunner.query(`DELETE FROM menus WHERE id <= 503`);
  }
}

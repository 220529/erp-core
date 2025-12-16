import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 简化角色配置，删除销售角色和 salesId 字段
 * 
 * 最终角色：
 * - 系统管理员(admin)：全部权限
 * - 设计师(designer)：客户管理、订单管理、产品管理（核心业务）
 * - 工长(foreman)：查看订单
 * - 财务(finance)：收款管理、查看订单
 * 
 * 删除：
 * - 销售角色（职能合并到设计师）
 * - customers.sales_id 字段
 * - orders.sales_id 字段
 */
export class FixRolePermissions1734410000000 implements MigrationInterface {
  name = 'FixRolePermissions1734410000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 删除销售角色的权限关联
    await queryRunner.query(`DELETE FROM role_menus WHERE role = 'sales'`);
    
    // 2. 将使用销售角色的用户改为设计师（如果有的话）
    await queryRunner.query(`UPDATE users SET role = 'designer' WHERE role = 'sales'`);
    
    // 3. 删除销售角色
    await queryRunner.query(`DELETE FROM roles WHERE \`key\` = 'sales'`);

    // 4. 更新角色描述
    await queryRunner.query(`UPDATE roles SET description = '客户管理、订单管理、产品管理' WHERE \`key\` = 'designer'`);
    await queryRunner.query(`UPDATE roles SET description = '查看订单、施工管理' WHERE \`key\` = 'foreman'`);
    await queryRunner.query(`UPDATE roles SET description = '收款管理、查看订单' WHERE \`key\` = 'finance'`);

    // 5. 重新配置设计师权限：客户、订单、产品
    await queryRunner.query(`DELETE FROM role_menus WHERE role = 'designer'`);
    await queryRunner.query(`
      INSERT INTO role_menus (role, menu_id, created_at, updated_at) VALUES
      ('designer', 1, NOW(), NOW()),
      ('designer', 10, NOW(), NOW()),
      ('designer', 101, NOW(), NOW()),
      ('designer', 102, NOW(), NOW()),
      ('designer', 103, NOW(), NOW()),
      ('designer', 2, NOW(), NOW()),
      ('designer', 20, NOW(), NOW()),
      ('designer', 201, NOW(), NOW()),
      ('designer', 202, NOW(), NOW()),
      ('designer', 4, NOW(), NOW()),
      ('designer', 40, NOW(), NOW()),
      ('designer', 401, NOW(), NOW()),
      ('designer', 402, NOW(), NOW())
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `);

    // 6. 配置工长权限：查看订单
    await queryRunner.query(`DELETE FROM role_menus WHERE role = 'foreman'`);
    await queryRunner.query(`
      INSERT INTO role_menus (role, menu_id, created_at, updated_at) VALUES
      ('foreman', 2, NOW(), NOW()),
      ('foreman', 20, NOW(), NOW())
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `);

    // 7. 更新角色排序
    await queryRunner.query(`UPDATE roles SET sort = 2 WHERE \`key\` = 'designer'`);
    await queryRunner.query(`UPDATE roles SET sort = 3 WHERE \`key\` = 'foreman'`);
    await queryRunner.query(`UPDATE roles SET sort = 4 WHERE \`key\` = 'finance'`);

    // 8. 删除 sales_id 字段（先删除索引再删除字段）
    // 检查并删除 customers 表的 sales_id 索引
    const customerIndexes: any[] = await queryRunner.query(`SHOW INDEX FROM customers WHERE Column_name = 'sales_id'`);
    for (const idx of customerIndexes) {
      await queryRunner.query(`DROP INDEX \`${idx.Key_name}\` ON customers`);
    }
    // 删除 customers.sales_id 字段
    const customerColumn = await queryRunner.query(`SHOW COLUMNS FROM customers LIKE 'sales_id'`);
    if (customerColumn.length > 0) {
      await queryRunner.query(`ALTER TABLE customers DROP COLUMN sales_id`);
    }

    // 检查并删除 orders 表的 sales_id 索引
    const orderIndexes: any[] = await queryRunner.query(`SHOW INDEX FROM orders WHERE Column_name = 'sales_id'`);
    for (const idx of orderIndexes) {
      await queryRunner.query(`DROP INDEX \`${idx.Key_name}\` ON orders`);
    }
    // 删除 orders.sales_id 字段
    const orderColumn = await queryRunner.query(`SHOW COLUMNS FROM orders LIKE 'sales_id'`);
    if (orderColumn.length > 0) {
      await queryRunner.query(`ALTER TABLE orders DROP COLUMN sales_id`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 恢复销售角色
    await queryRunner.query(`
      INSERT INTO roles (id, \`key\`, name, description, sort, status, created_at, updated_at) VALUES
      (2, 'sales', '销售', '客户管理、订单管理', 2, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    // 恢复 sales_id 字段
    await queryRunner.query(`ALTER TABLE customers ADD COLUMN sales_id INT NULL COMMENT '负责销售ID'`);
    await queryRunner.query(`ALTER TABLE orders ADD COLUMN sales_id INT NULL`);
    await queryRunner.query(`CREATE INDEX \`IDX_customers_salesId\` ON customers (sales_id)`);
  }
}

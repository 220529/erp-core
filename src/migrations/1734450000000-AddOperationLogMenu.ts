import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 添加操作日志菜单（系统管理下）
 */
export class AddOperationLogMenu1734450000000 implements MigrationInterface {
  name = 'AddOperationLogMenu1734450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 获取系统管理菜单ID（通过 name 或 path 查找）
    const [systemMenu] = await queryRunner.query(
      `SELECT id FROM menus WHERE name = 'system' OR path = '/system' LIMIT 1`,
    );

    if (!systemMenu) {
      console.log('系统管理菜单不存在，跳过');
      return;
    }

    const parentId = systemMenu.id;

    // 添加操作日志菜单
    await queryRunner.query(`
      INSERT INTO menus (id, name, title, path, icon, parent_id, sort, type, permission, status)
      VALUES (108, 'system:log', '操作日志', '/system/log', 'FileTextOutlined', ${parentId}, 40, 'menu', 'log:list', 1)
      ON DUPLICATE KEY UPDATE title = '操作日志', path = '/system/log', icon = 'FileTextOutlined'
    `);

    // 给管理员角色关联菜单
    await queryRunner.query(`
      INSERT INTO role_menus (role, menu_id, created_at, updated_at)
      VALUES ('admin', 108, NOW(), NOW())
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除角色菜单关联
    await queryRunner.query(`DELETE FROM role_menus WHERE role = 'admin' AND menu_id = 108`);
    // 删除菜单
    await queryRunner.query(`DELETE FROM menus WHERE id = 108`);
  }
}

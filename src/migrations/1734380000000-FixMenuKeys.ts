import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 修复菜单 key 重复问题
 * 一级菜单作为分组，不需要 path
 */
export class FixMenuKeys1734380000000 implements MigrationInterface {
  name = 'FixMenuKeys1734380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 清空一级菜单的 path，避免与二级菜单 key 重复
    await queryRunner.query(`UPDATE menus SET path = NULL WHERE parent_id IS NULL AND type = 'menu'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 恢复一级菜单的 path
    await queryRunner.query(`UPDATE menus SET path = '/customer' WHERE id = 1`);
    await queryRunner.query(`UPDATE menus SET path = '/order' WHERE id = 2`);
    await queryRunner.query(`UPDATE menus SET path = '/material' WHERE id = 3`);
    await queryRunner.query(`UPDATE menus SET path = '/product' WHERE id = 4`);
    await queryRunner.query(`UPDATE menus SET path = '/payment' WHERE id = 5`);
    await queryRunner.query(`UPDATE menus SET path = '/system' WHERE id = 6`);
  }
}

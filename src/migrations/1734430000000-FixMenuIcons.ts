import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 修复二级菜单图标 + 修复设计师权限（产品和材料只能查看）
 */
export class FixMenuIcons1734430000000 implements MigrationInterface {
  name = 'FixMenuIcons1734430000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 基础数据二级菜单图标
    await queryRunner.query(`UPDATE menus SET icon = 'BookOutlined' WHERE id = 70`);
    await queryRunner.query(`UPDATE menus SET icon = 'CodeOutlined' WHERE id = 71`);
    await queryRunner.query(`UPDATE menus SET icon = 'FolderOutlined' WHERE id = 72`);

    // 2. 系统管理二级菜单图标
    await queryRunner.query(`UPDATE menus SET icon = 'ApartmentOutlined' WHERE id = 60`);
    await queryRunner.query(`UPDATE menus SET icon = 'SafetyOutlined' WHERE id = 61`);
    await queryRunner.query(`UPDATE menus SET icon = 'KeyOutlined' WHERE id = 62`);
    await queryRunner.query(`UPDATE menus SET icon = 'ClockCircleOutlined' WHERE id = 63`);

    // 3. 修复设计师权限：删除产品和材料的编辑按钮权限（只保留查看）
    // 删除产品按钮权限 (401=新增, 402=编辑, 403=删除)
    await queryRunner.query(`DELETE FROM role_menus WHERE role = 'designer' AND menu_id IN (401, 402, 403)`);
    // 删除材料按钮权限 (301=新增, 302=编辑, 303=删除)
    await queryRunner.query(`DELETE FROM role_menus WHERE role = 'designer' AND menu_id IN (301, 302, 303)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE menus SET icon = NULL WHERE id IN (60, 61, 62, 63, 70, 71, 72)`);
  }
}

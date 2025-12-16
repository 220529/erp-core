import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 修正菜单路径，使其与前端路由一致
 */
export class FixMenuPaths1734370000000 implements MigrationInterface {
  name = 'FixMenuPaths1734370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 修正二级菜单路径
    await queryRunner.query(`UPDATE menus SET path = '/customer' WHERE id = 10`);
    await queryRunner.query(`UPDATE menus SET path = '/order' WHERE id = 20`);
    await queryRunner.query(`UPDATE menus SET path = '/material' WHERE id = 30`);
    await queryRunner.query(`UPDATE menus SET path = '/product' WHERE id = 40`);
    await queryRunner.query(`UPDATE menus SET path = '/finance' WHERE id = 50`);

    // 删除未实现的菜单
    await queryRunner.query(`DELETE FROM role_menus WHERE menu_id IN (11, 62, 64)`);
    await queryRunner.query(`DELETE FROM menus WHERE id IN (11, 62, 64)`);

    // 调整组织架构菜单排序
    await queryRunner.query(`UPDATE menus SET sort = 1 WHERE id = 60`);

    // 删除默认公司和部门（如果存在）
    await queryRunner.query(`DELETE FROM departments WHERE company_id = 1 AND id <= 5`);
    await queryRunner.query(`DELETE FROM companies WHERE id = 1 AND name = '默认公司'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 恢复原路径
    await queryRunner.query(`UPDATE menus SET path = '/customer/list' WHERE id = 10`);
    await queryRunner.query(`UPDATE menus SET path = '/order/list' WHERE id = 20`);
    await queryRunner.query(`UPDATE menus SET path = '/material/list' WHERE id = 30`);
    await queryRunner.query(`UPDATE menus SET path = '/product/list' WHERE id = 40`);
    await queryRunner.query(`UPDATE menus SET path = '/payment/list' WHERE id = 50`);
  }
}

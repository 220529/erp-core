import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 更新订单状态枚举
 * - draft → pending (待签约)
 * - cancelled → voided (已作废)
 */
export class UpdateOrderStatusEnum1734440000000 implements MigrationInterface {
  name = 'UpdateOrderStatusEnum1734440000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 先扩展 enum 包含所有新旧值
    await queryRunner.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('draft', 'pending', 'signed', 'in_progress', 'completed', 'cancelled', 'voided') 
      DEFAULT 'pending'
    `);

    // 2. 更新数据：旧值 → 新值
    await queryRunner.query(`UPDATE orders SET status = 'pending' WHERE status = 'draft'`);
    await queryRunner.query(`UPDATE orders SET status = 'voided' WHERE status = 'cancelled'`);

    // 3. 收缩 enum 只保留新值
    await queryRunner.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('pending', 'signed', 'in_progress', 'completed', 'voided') 
      DEFAULT 'pending' 
      COMMENT '订单状态: pending-待签约, signed-已签约, in_progress-施工中, completed-已完工, voided-已作废'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚
    await queryRunner.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('draft', 'pending', 'signed', 'in_progress', 'completed', 'cancelled', 'voided') 
      DEFAULT 'draft'
    `);

    await queryRunner.query(`UPDATE orders SET status = 'draft' WHERE status = 'pending'`);
    await queryRunner.query(`UPDATE orders SET status = 'cancelled' WHERE status = 'voided'`);

    await queryRunner.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('draft', 'signed', 'in_progress', 'completed', 'cancelled') 
      DEFAULT 'draft' 
      COMMENT '订单状态: draft-草稿, signed-已签约, in_progress-施工中, completed-已完工, cancelled-已取消'
    `);
  }
}

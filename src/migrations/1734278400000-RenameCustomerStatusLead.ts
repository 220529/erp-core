import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 将客户状态 lead 改为 new
 */
export class RenameCustomerStatusLead1734278400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 修改 enum 类型，添加 new 值
    await queryRunner.query(`
      ALTER TABLE customers 
      MODIFY COLUMN status ENUM('lead', 'new', 'measured', 'quoted', 'signed', 'completed') 
      DEFAULT 'new'
    `);

    // 2. 更新现有数据
    await queryRunner.query(`
      UPDATE customers SET status = 'new' WHERE status = 'lead'
    `);

    // 3. 移除 lead 值
    await queryRunner.query(`
      ALTER TABLE customers 
      MODIFY COLUMN status ENUM('new', 'measured', 'quoted', 'signed', 'completed') 
      DEFAULT 'new'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚：将 new 改回 lead
    await queryRunner.query(`
      ALTER TABLE customers 
      MODIFY COLUMN status ENUM('lead', 'new', 'measured', 'quoted', 'signed', 'completed') 
      DEFAULT 'lead'
    `);

    await queryRunner.query(`
      UPDATE customers SET status = 'lead' WHERE status = 'new'
    `);

    await queryRunner.query(`
      ALTER TABLE customers 
      MODIFY COLUMN status ENUM('lead', 'measured', 'quoted', 'signed', 'completed') 
      DEFAULT 'lead'
    `);
  }
}

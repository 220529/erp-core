import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 code_flows 表添加 published_at 字段
 * 用于记录代码流程最后发布到生产环境的时间
 */
export class AddPublishedAtToCodeFlows1735030000000 implements MigrationInterface {
  name = 'AddPublishedAtToCodeFlows1735030000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE code_flows 
      ADD COLUMN published_at DATETIME NULL COMMENT '最后发布到生产环境的时间'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE code_flows DROP COLUMN published_at
    `);
  }
}

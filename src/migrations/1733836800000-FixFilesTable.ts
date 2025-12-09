import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixFilesTable1733836800000 implements MigrationInterface {
  name = 'FixFilesTable1733836800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 检查是否存在旧结构的 files 表（没有 is_folder 字段）
    const hasIsFolder = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'files' AND COLUMN_NAME = 'is_folder'
    `);

    if (hasIsFolder.length === 0) {
      // 旧表存在但结构不对，删除重建
      await queryRunner.query(`DROP TABLE IF EXISTS \`files\``);
      
      await queryRunner.query(`
        CREATE TABLE \`files\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(255) NOT NULL COMMENT '文件/文件夹名称',
          \`is_folder\` tinyint NOT NULL DEFAULT 0 COMMENT '是否为文件夹',
          \`parent_id\` int NULL COMMENT '父文件夹ID',
          \`url\` varchar(500) NULL COMMENT 'OSS访问URL',
          \`storage_path\` varchar(500) NULL COMMENT 'OSS存储路径',
          \`size\` bigint NULL DEFAULT 0 COMMENT '文件大小(字节)',
          \`uploaded_by\` int NULL COMMENT '上传者ID',
          \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`),
          INDEX \`idx_files_parent_id\` (\`parent_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚不做任何操作，避免数据丢失
  }
}

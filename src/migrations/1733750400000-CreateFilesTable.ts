import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFilesTable1733750400000 implements MigrationInterface {
  name = 'CreateFilesTable1733750400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`files\` (
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`files\``);
  }
}

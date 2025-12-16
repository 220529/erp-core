import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765876557658 implements MigrationInterface {
    name = 'Migration1765876557658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`target_id\` int NULL COMMENT '业务对象ID(订单ID/客户ID等)'`);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`request_body\` text NULL COMMENT '请求参数JSON'`);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`response_body\` text NULL COMMENT '响应结果JSON'`);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`status\` varchar(20) NULL COMMENT '操作状态: success/error' DEFAULT 'success'`);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`error_msg\` text NULL COMMENT '错误信息'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` varchar(50) NOT NULL COMMENT '角色标识' DEFAULT 'designer'`);
        await queryRunner.query(`ALTER TABLE \`role_menus\` CHANGE \`role\` \`role\` varchar(50) NOT NULL COMMENT '角色标识(admin/designer/foreman/finance)'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'signed', 'in_progress', 'completed', 'voided') NOT NULL COMMENT '订单状态: pending-待签约, signed-已签约, in_progress-施工中, completed-已完工, voided-已作废' DEFAULT 'pending'`);
        await queryRunner.query(`DROP INDEX \`IDX_807abb1f01d751e24c2a5fda8e\` ON \`logs\``);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`action\``);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`action\` varchar(100) NOT NULL COMMENT '操作类型/名称'`);
        await queryRunner.query(`ALTER TABLE \`logs\` CHANGE \`content\` \`content\` text NULL COMMENT '操作详细内容/描述'`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`key\` \`key\` varchar(50) NOT NULL COMMENT '角色标识(admin/designer/foreman/finance)'`);
        await queryRunner.query(`CREATE INDEX \`IDX_9812ba1da157dd56e03c107623\` ON \`customers\` (\`designer_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_969a2106cf384d442853bde822\` ON \`logs\` (\`status\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f48dd39b126b156e16fa13e7d3\` ON \`logs\` (\`target_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_807abb1f01d751e24c2a5fda8e\` ON \`logs\` (\`action\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_807abb1f01d751e24c2a5fda8e\` ON \`logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_f48dd39b126b156e16fa13e7d3\` ON \`logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_969a2106cf384d442853bde822\` ON \`logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_9812ba1da157dd56e03c107623\` ON \`customers\``);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`key\` \`key\` varchar(50) NOT NULL COMMENT '角色标识(admin/sales/designer/foreman/finance)'`);
        await queryRunner.query(`ALTER TABLE \`logs\` CHANGE \`content\` \`content\` text NULL COMMENT '操作详细内容'`);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`action\``);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`action\` varchar(20) NOT NULL COMMENT '操作类型(create/update/delete/view等)'`);
        await queryRunner.query(`CREATE INDEX \`IDX_807abb1f01d751e24c2a5fda8e\` ON \`logs\` (\`action\`)`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'signed', 'in_progress', 'completed', 'voided') NULL COMMENT '订单状态: pending-待签约, signed-已签约, in_progress-施工中, completed-已完工, voided-已作废' DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`role_menus\` CHANGE \`role\` \`role\` varchar(50) NOT NULL COMMENT '角色标识(admin/sales/designer/foreman/finance)'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` varchar(50) NOT NULL COMMENT '角色标识' DEFAULT 'sales'`);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`error_msg\``);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`response_body\``);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`request_body\``);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`target_id\``);
    }

}

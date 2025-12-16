import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskExecutions1765849422078 implements MigrationInterface {
    name = 'CreateTaskExecutions1765849422078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`task_executions\` (\`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`task_name\` varchar(50) NOT NULL COMMENT '任务名称', \`executed_at\` datetime NOT NULL COMMENT '执行时间', \`duration\` int NOT NULL COMMENT '执行耗时(毫秒)', \`success\` tinyint NOT NULL COMMENT '是否成功' DEFAULT 1, \`result\` text NULL COMMENT '执行结果', \`error\` text NULL COMMENT '错误信息', \`trigger_type\` varchar(20) NOT NULL COMMENT '触发类型: cron/manual' DEFAULT 'cron', INDEX \`IDX_cd471988303ceb64b8fba7f6f8\` (\`executed_at\`), INDEX \`IDX_f5a526e7f7c5a5beaf0fa5b982\` (\`task_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB COMMENT="定时任务执行记录表"`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`status\` \`status\` enum ('new', 'measured', 'quoted', 'signed', 'completed') NOT NULL COMMENT '客户状态: new-新客户, measured-已量房, quoted-已报价, signed-已签约, completed-已完工' DEFAULT 'new'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`status\` \`status\` enum ('new', 'measured', 'quoted', 'signed', 'completed') NULL DEFAULT 'new'`);
        await queryRunner.query(`DROP INDEX \`IDX_f5a526e7f7c5a5beaf0fa5b982\` ON \`task_executions\``);
        await queryRunner.query(`DROP INDEX \`IDX_cd471988303ceb64b8fba7f6f8\` ON \`task_executions\``);
        await queryRunner.query(`DROP TABLE \`task_executions\``);
    }

}

/**
 * 生产环境 Migration 运行脚本
 * 使用编译后的 JS 文件运行，无需 ts-node
 */
const { DataSource } = require('typeorm');
const path = require('path');

async function runMigrations() {
    console.log('🚀 开始运行数据库迁移...');
    
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_DATABASE || 'erp_core',
        entities: [path.join(__dirname, '../dist/**/*.entity.js')],
        migrations: [path.join(__dirname, '../dist/migrations/*.js')],
        migrationsTableName: 'typeorm_migrations',
        synchronize: false,
    });

    try {
        await dataSource.initialize();
        console.log('📦 数据库连接成功');
        
        const pendingMigrations = await dataSource.showMigrations();
        if (pendingMigrations) {
            console.log('📋 发现待执行的迁移，开始执行...');
            await dataSource.runMigrations();
            console.log('✅ 迁移执行完成');
        } else {
            console.log('✅ 没有待执行的迁移');
        }
        
        await dataSource.destroy();
    } catch (error) {
        console.error('❌ 迁移执行失败:', error.message);
        // 迁移失败不阻止应用启动，但记录错误
        // 如果想要失败时阻止启动，取消下面的注释
        // process.exit(1);
    }
}

runMigrations();

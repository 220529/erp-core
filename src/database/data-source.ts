import { DataSource } from 'typeorm';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'erp_core',
    // 生产环境用编译后的 JS，开发环境用 TS
    entities: isProduction 
        ? ['dist/**/*.entity.js'] 
        : ['src/**/*.entity.ts'],
    migrations: isProduction 
        ? ['dist/migrations/*.js'] 
        : ['src/migrations/*.ts'],
    synchronize: false,
});

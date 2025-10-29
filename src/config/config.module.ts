import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';

/**
 * 根据环境变量选择对应的 .env 文件
 */
function getEnvFilePath(): string[] {
  const env = process.env.NODE_ENV;
  const envFiles: string[] = [];

  // 优先级: .env.[environment] > .env.local > .env
  if (env) {
    envFiles.push(`.env.${env}`);
  }
  envFiles.push('.env.local');
  envFiles.push('.env');

  return envFiles;
}

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: getEnvFilePath(),
      expandVariables: true, // 支持变量扩展
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}


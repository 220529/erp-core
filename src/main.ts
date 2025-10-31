import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,           // 自动剥离未定义的属性
      forbidNonWhitelisted: false, // 不禁止额外字段，只是自动过滤掉
    }),
  );

  // CORS 配置
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('ERP Core API')
    .setDescription('极简装修ERP系统核心API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证模块')
    .addTag('constants', '系统常量')
    .addTag('users', '用户管理')
    .addTag('customers', '客户管理')
    .addTag('orders', '订单管理')
    .addTag('materials', '材料管理')
    .addTag('products', '产品套餐管理')
    .addTag('payments', '收款管理')
    .addTag('files', '文件管理')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3009;
  await app.listen(port);

  console.log(`
    🚀 ERP Core API 启动成功
    📝 API 文档: http://localhost:${port}/api-docs
    🌐 应用地址: http://localhost:${port}/api
  `);
}
bootstrap();

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CodeModule } from './modules/code/code.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, CodeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

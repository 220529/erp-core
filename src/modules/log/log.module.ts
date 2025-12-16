import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from '../../entities/log.entity';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { OperationLogInterceptor } from '../../common/interceptors/operation-log.interceptor';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [LogController],
  providers: [LogService, OperationLogInterceptor],
  exports: [LogService, OperationLogInterceptor, TypeOrmModule],
})
export class LogModule {}

import { Controller, Get, Query, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogService } from './log.service';

@ApiTags('logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @ApiOperation({ summary: '查询操作日志列表' })
  async findList(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.logService.findList({
      page,
      pageSize,
      module,
      action,
      userId,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '查询日志详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.logService.findOne(id);
  }

  @Get('target/:module/:targetId')
  @ApiOperation({ summary: '查询业务对象操作历史' })
  async getTargetHistory(
    @Param('module') module: string,
    @Param('targetId', ParseIntPipe) targetId: number,
  ) {
    return this.logService.getTargetHistory(module, targetId);
  }
}

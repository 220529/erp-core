import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CodeExecutorService } from './code-executor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/constants';
import {
  ExecuteFlowDto,
  CreateFlowDto,
  UpdateFlowDto,
} from './dto/code.dto';

@ApiTags('code')
@Controller('code')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CodeController {
  constructor(
    private readonly codeExecutorService: CodeExecutorService,
  ) {}

  @Post('execute/:flowCode')
  @ApiOperation({ summary: '执行代码流程' })
  @ApiParam({ name: 'flowCode', description: '流程编码' })
  async executeFlow(
    @Param('flowCode') flowCode: string,
    @Body() executeFlowDto: ExecuteFlowDto,
    @Request() req,
  ) {
    return this.codeExecutorService.executeFlow(
      flowCode,
      executeFlowDto.params,
      req.user,
    );
  }

  @Get('flows')
  @ApiOperation({ summary: '列出所有可用的代码流程' })
  async listFlows() {
    return this.codeExecutorService.listFlows();
  }

  @Post('flows')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建代码流程（仅管理员）' })
  async createFlow(@Body() createFlowDto: CreateFlowDto, @Request() req) {
    return this.codeExecutorService.createFlow({
      ...createFlowDto,
      createdBy: req.user.id,
    });
  }

  @Put('flows/:flowCode')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新代码流程（仅管理员）' })
  @ApiParam({ name: 'flowCode', description: '流程编码' })
  async updateFlow(
    @Param('flowCode') flowCode: string,
    @Body() updateFlowDto: UpdateFlowDto,
    @Request() req,
  ) {
    return this.codeExecutorService.updateFlow(flowCode, {
      ...updateFlowDto,
      updatedBy: req.user.id,
    });
  }

  @Delete('flows/:flowCode')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除/禁用代码流程（仅管理员）' })
  @ApiParam({ name: 'flowCode', description: '流程编码' })
  async deleteFlow(@Param('flowCode') flowCode: string) {
    await this.codeExecutorService.deleteFlow(flowCode);
    return { message: '代码流程已禁用' };
  }

  @Post('flows/:flowCode/clear-cache')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '清除流程缓存（仅管理员）' })
  @ApiParam({ name: 'flowCode', description: '流程编码（可选）' })
  async clearCache(@Param('flowCode') flowCode?: string) {
    this.codeExecutorService.clearCache(flowCode);
    return { message: '缓存已清除' };
  }
}


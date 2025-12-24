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
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CodeExecutorService } from './code-executor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { OperationLog } from '../../common/decorators/operation-log.decorator';
import { UserRole } from '../../common/constants';
import {
  ExecuteFlowDto,
  CreateFlowDto,
  UpdateFlowDto,
  UploadCodeDto,
} from './dto/code.dto';

@ApiTags('code')
@Controller('code')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CodeController {
  constructor(
    private readonly codeExecutorService: CodeExecutorService,
    private readonly configService: ConfigService,
  ) {}

  @Post('run/:flowKey')
  @ApiOperation({ summary: '执行代码流程' })
  @ApiParam({ name: 'flowKey', description: '流程唯一标识key' })
  @OperationLog({
    action: '执行代码流程',
    module: 'codeflow',
    targetIdParam: 'flowKey',
    description: (req) => `执行流程: ${req.params.flowKey}`,
  })
  async executeFlow(
    @Param('flowKey') flowKey: string,
    @Body() executeFlowDto: ExecuteFlowDto,
    @Request() req,
  ) {
    return this.codeExecutorService.executeFlow(
      flowKey,
      executeFlowDto.params,
      req.user,
    );
  }

  @Public()
  @Get('flows')
  @ApiOperation({ summary: '列出所有可用的代码流程' })
  async listFlows() {
    return this.codeExecutorService.listFlows();
  }

  @Public()
  @Get('flows/:flowKey')
  @ApiOperation({ summary: '查询单个流程详情' })
  @ApiParam({ name: 'flowKey', description: '流程唯一标识key' })
  async getFlow(@Param('flowKey') flowKey: string) {
    return this.codeExecutorService.getFlow(flowKey);
  }

  @Public()
  @Post('flows')
  @ApiOperation({ summary: '创建代码流程' })
  async createFlow(@Body() createFlowDto: CreateFlowDto, @Request() req) {
    return this.codeExecutorService.createFlow({
      ...createFlowDto,
      createdBy: req.user?.id,
    });
  }

  @Put('flows/:flowKey')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新代码流程（仅管理员）' })
  @ApiParam({ name: 'flowKey', description: '流程唯一标识key' })
  async updateFlow(
    @Param('flowKey') flowKey: string,
    @Body() updateFlowDto: UpdateFlowDto,
    @Request() req,
  ) {
    return this.codeExecutorService.updateFlow(flowKey, {
      ...updateFlowDto,
      updatedBy: req.user.id,
    });
  }

  @Public()
  @Put('flows/:flowKey/publish-status')
  @ApiOperation({ summary: '更新发布状态（不触发 updatedAt 更新）' })
  @ApiParam({ name: 'flowKey', description: '流程唯一标识key' })
  async updatePublishStatus(
    @Param('flowKey') flowKey: string,
    @Body() body: { publishedAt: string },
  ) {
    await this.codeExecutorService.updatePublishedAt(flowKey, body.publishedAt);
    return { message: '发布状态已更新' };
  }

  @Delete('flows/:flowKey')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除/禁用代码流程（仅管理员）' })
  @ApiParam({ name: 'flowKey', description: '流程唯一标识key' })
  async deleteFlow(@Param('flowKey') flowKey: string) {
    await this.codeExecutorService.deleteFlow(flowKey);
    return { message: '代码流程已禁用' };
  }

  @Post('flows/:flowKey/clear-cache')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '清除流程缓存（仅管理员）' })
  @ApiParam({ name: 'flowKey', description: '流程唯一标识key（可选）' })
  async clearCache(@Param('flowKey') flowKey?: string) {
    this.codeExecutorService.clearCache(flowKey);
    return { message: '缓存已清除' };
  }

  @Post('generate-access-secret')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '生成新的访问密钥（仅管理员）' })
  async generateAccessSecret() {
    const newSecret = randomBytes(32).toString('hex');
    return {
      accessSecret: newSecret,
      description: '用于 erp-code 项目上传代码时的身份验证',
      usage: '在 erp-code 项目的 .env.local 中配置：UPLOAD_ACCESS_SECRET=此密钥',
    };
  }

  @Public()
  @Post('upload')
  @ApiOperation({ summary: '上传代码流程（erp-code 项目使用）' })
  @ApiHeader({
    name: 'x-access-secret',
    description: '访问密钥（配置在环境变量 UPLOAD_ACCESS_SECRET 中）',
    required: true,
  })
  async uploadCode(
    @Body() uploadCodeDto: UploadCodeDto,
    @Headers('x-access-secret') accessSecret: string,
  ) {
    // 验证 accessSecret
    const validSecret = this.configService.get<string>('upload.accessSecret');
    const env = this.configService.get<string>('env');
    
    if (!validSecret) {
      throw new UnauthorizedException(
        '服务器未配置 UPLOAD_ACCESS_SECRET，请联系管理员'
      );
    }
    
    // 生产环境安全检查：不允许使用测试环境的密钥
    if (env === 'production' && validSecret === '0689caf138107efec54461b6c1d7d8d71922b895fc41831b313cb9e9b4ea4320') {
      throw new UnauthorizedException(
        '⚠️ 生产环境禁止使用测试密钥！请配置生产环境专用的 UPLOAD_ACCESS_SECRET'
      );
    }
    
    if (!accessSecret || accessSecret !== validSecret) {
      throw new UnauthorizedException('无效的 access secret');
    }
    
    // 时间戳验证（防重放攻击）
    if (uploadCodeDto.timestamp) {
      const now = Date.now();
      const diff = Math.abs(now - uploadCodeDto.timestamp);
      const THIRTY_MINUTES = 30 * 60 * 1000;
      
      if (diff > THIRTY_MINUTES) {
        throw new UnauthorizedException(
          '请求已过期（超过30分钟），请重新上传'
        );
      }
    }
    
    return this.codeExecutorService.uploadCode(uploadCodeDto);
  }
}


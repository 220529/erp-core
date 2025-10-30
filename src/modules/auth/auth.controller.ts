import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req) {
    const { password, ...userInfo } = req.user;
    return userInfo;
  }

  @Get('access-secret')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取 Access Secret（用于 erp-code 项目）' })
  async getAccessSecret() {
    const accessSecret = this.configService.get<string>('upload.accessSecret');
    
    if (!accessSecret) {
      throw new UnauthorizedException('服务器未配置 UPLOAD_ACCESS_SECRET，请联系管理员在环境变量中配置');
    }

    return {
      accessSecret,
      description: '用于 erp-code 项目上传代码时的身份验证',
      usage: '在 erp-code 项目的 .env.local 中配置：UPLOAD_ACCESS_SECRET=此密钥',
    };
  }
}


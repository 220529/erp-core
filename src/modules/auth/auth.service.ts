import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { IJwtPayload } from '../../common/interfaces/response.interface';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => PermissionService))
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态 (1-正常 0-禁用 2-锁定)
    if (user.status !== 1) {
      throw new UnauthorizedException('用户已被禁用或锁定');
    }

    // 生成 JWT Token
    const payload: IJwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      companyId: user.companyId,
      departmentId: user.departmentId,
    };

    const token = this.jwtService.sign(payload);

    // 获取用户权限和菜单
    const [permissions, menus] = await Promise.all([
      this.permissionService.getUserPermissions(user.role),
      this.permissionService.getUserMenus(user.role),
    ]);

    // 移除敏感信息
    const { password: _, ...userInfo } = user;

    return {
      token,
      user: userInfo,
      permissions,
      menus,
    };
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto) {
    const { username, password, name, mobile, role } = registerDto;

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { mobile }],
    });

    if (existingUser) {
      throw new UnauthorizedException('用户名或手机号已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      name,
      mobile,
      role,
    });

    await this.userRepository.save(user);

    // 移除敏感信息
    const { password: _, ...userInfo } = user;

    return userInfo;
  }

  /**
   * 验证用户（用于 JWT Strategy）
   */
  async validateUser(payload: IJwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 1) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return user;
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}

